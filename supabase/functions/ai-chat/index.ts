import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('未授权');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未登录');
    }

    const { sessionId, message, baziRecordId } = await req.json();

    if (!message) {
      throw new Error('消息不能为空');
    }

    // 输入验证
    if (message.length < 1 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: '消息长度必须在1-2000字符之间' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 获取用户会员等级
    const { data: membershipData } = await supabase
      .from('user_memberships')
      .select('tier')
      .eq('user_id', user.id)
      .single();
    
    const membershipTier = membershipData?.tier || 'free';

    // 月度使用次数限制检查
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyUsage, error: usageCheckError } = await supabase
      .from('ai_usage_records')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('usage_type', 'ai_reading')
      .gte('created_at', startOfMonth.toISOString());

    if (usageCheckError) {
      console.error('检查月度使用记录失败:', usageCheckError);
    }

    const monthlyUsageCount = monthlyUsage?.length || 0;

    // 根据会员等级检查月度限制
    const monthlyLimits: Record<string, number> = {
      free: 3,
      basic: 20,
      premium: 100,
      vip: -1 // 无限
    };
    const monthlyLimit = monthlyLimits[membershipTier] || monthlyLimits.free;

    if (monthlyLimit !== -1 && monthlyUsageCount >= monthlyLimit) {
      throw new Error(`本月AI解读次数已用完（${monthlyUsageCount}/${monthlyLimit}次），升级会员可获得更多次数`);
    }

    // 速率限制检查
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentUsage } = await supabase
      .from('ai_usage_records')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo);

    const rateLimits: Record<string, number> = {
      free: 3,
      basic: 5,
      premium: 10,
      vip: 15
    };
    const limit = rateLimits[membershipTier] || rateLimits.free;

    if (recentUsage && recentUsage.length >= limit) {
      throw new Error(`速率限制：${membershipTier}会员每分钟最多${limit}次请求，请稍后再试`);
    }

    // 获取或创建会话
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id,
          bazi_record_id: baziRecordId,
          title: message.substring(0, 50)
        })
        .select()
        .single();

      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
    }

    // 获取聊天历史
    const { data: history } = await supabase
      .from('ai_chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // 获取八字信息（如果有）
    let baziContext = '';
    if (baziRecordId) {
      const { data: baziRecord } = await supabase
        .from('bazi_records')
        .select('result')
        .eq('id', baziRecordId)
        .eq('user_id', user.id)
        .single();

      if (baziRecord) {
        const baziInfo = baziRecord.result;
        baziContext = `\n\n【用户八字信息】
年柱：${baziInfo.bazi?.year || ''}
月柱：${baziInfo.bazi?.month || ''}
日柱：${baziInfo.bazi?.day || ''}
时柱：${baziInfo.bazi?.hour || ''}
格局：${baziInfo.pattern?.pattern || '待判断'}
${baziInfo.pattern?.description ? '格局说明：' + baziInfo.pattern.description : ''}`;
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI服务未配置');
    }

    // 构建系统提示词
    const systemPrompt = `你是一位专业的八字命理顾问，精通《渊海子平》《三命通会》《滴天髓》等古籍。

你的任务：
1. 如果用户提供了八字信息，基于八字进行专业分析
2. 解答用户关于命理、运势、人生规划的问题
3. 提供实用、建设性的建议
4. 保持专业、温和、鼓励的语气

重要原则：
- 避免绝对化表述（禁用"必定/绝对/一定"）
- 给予用户选择权和主动性
- 强调努力和选择的重要性
- 末尾标注"仅供参考"${baziContext}`;

    // 构建消息历史
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    console.log('开始调用AI聊天，会话ID:', currentSessionId);

    // 调用Lovable AI（流式）
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        stream: true,
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API错误:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('请求过于频繁，请稍后再试');
      }
      if (response.status === 402) {
        throw new Error('AI服务配额不足，请联系管理员');
      }
      throw new Error(`AI服务暂时不可用 (${response.status})`);
    }

    // 保存用户消息
    await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message
      });

    // 记录AI使用次数
    await supabase
      .from('ai_usage_records')
      .insert({
        user_id: user.id,
        usage_type: 'ai_reading',
        bazi_record_id: baziRecordId
      });

    // 返回流式响应
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Session-Id': currentSessionId
      },
    });

  } catch (error) {
    console.error('AI聊天错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '聊天失败' 
      }),
      {
        status: error instanceof Error && error.message.includes('未授权') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});