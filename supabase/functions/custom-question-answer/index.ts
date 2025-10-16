import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { questionId, question, baziData } = await req.json();

    if (!questionId || !question || !baziData) {
      throw new Error('缺少必要参数');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI服务未配置');
    }

    // 构建AI提示词
    const baziInfo = baziData;
    const systemPrompt = `你是一位精通《渊海子平》《三命通会》《滴天髓》等古籍的命理学专家，擅长根据八字回答具体问题。

核心原则：
1. 基于传统命理体系进行专业分析
2. 禁用封建迷信表述，用现代化语言表达
3. 避免绝对化表述（禁用"必定/绝对/一定"）
4. 提供建设性、实用性建议
5. 所有解答末尾必须标注"以上建议仅供参考，人生走向取决于自身选择与努力"

解答要求：
- 针对用户的具体问题，结合八字特点给出专业分析
- 字数控制在200-400字
- 语言通俗易懂，避免过多术语堆砌
- 提供具体可行的建议`;

    const userPrompt = `【用户问题】
${question}

【八字信息】
四柱：${baziInfo.bazi?.year || ''} ${baziInfo.bazi?.month || ''} ${baziInfo.bazi?.day || ''} ${baziInfo.bazi?.hour || ''}
格局：${baziInfo.pattern?.pattern || '待判断'}
${baziInfo.pattern?.isSpecial ? `（特殊格局：${baziInfo.pattern.description}）` : ''}
用神：${baziInfo.yongshen?.yongshen || '待判断'}
日主强弱：${baziInfo.dayMasterStrength || '待判断'}

请针对用户的问题，结合以上八字信息给出专业建议。`;

    // 调用Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API错误:', response.status, errorText);
      throw new Error(`AI服务暂时不可用 (${response.status})`);
    }

    const aiData = await response.json();
    const answer = aiData.choices[0]?.message?.content;

    if (!answer) {
      throw new Error('AI解答生成失败');
    }

    // 更新问题记录
    const { error: updateError } = await supabase
      .from('custom_questions')
      .update({
        answer,
        status: 'answered',
        answered_at: new Date().toISOString(),
      })
      .eq('id', questionId);

    if (updateError) {
      console.error('更新问题记录失败:', updateError);
    }

    // 记录AI使用
    const { error: usageError } = await supabase
      .from('ai_usage_records')
      .insert({
        user_id: user.id,
        usage_type: 'custom_question',
      });

    if (usageError) {
      console.error('记录使用次数失败:', usageError);
    }

    return new Response(
      JSON.stringify({ success: true, answer }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('自定义问题解答错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '解答失败' 
      }),
      {
        status: error instanceof Error && error.message.includes('未授权') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
