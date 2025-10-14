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

    const { baziRecordId, readingType } = await req.json();

    if (!baziRecordId || !readingType) {
      throw new Error('缺少必要参数');
    }

    // 获取八字记录
    const { data: baziRecord, error: fetchError } = await supabase
      .from('bazi_records')
      .select('*')
      .eq('id', baziRecordId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !baziRecord) {
      throw new Error('八字记录不存在');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI服务未配置');
    }

    // 构建提示词
    const baziInfo = baziRecord.result;
    const readingTypeMap: Record<string, string> = {
      career: '事业运势',
      love: '感情运势',
      health: '健康运势',
      wealth: '财富运势',
      general: '综合运势',
    };

    const systemPrompt = `你是一位精通中国传统命理学的AI命理师，擅长八字分析。请基于用户的八字信息，提供专业、准确且富有洞察力的命理解读。

重要提示：
1. 所有解读内容仅供参考，不应被视为绝对真理
2. 保持专业、客观、积极的语气
3. 避免使用封建迷信的表述
4. 提供建设性的人生建议
5. 解读应在150-300字之间，简洁明了`;

    const userPrompt = `八字信息：
年柱：${baziInfo.bazi.year}
月柱：${baziInfo.bazi.month}
日柱：${baziInfo.bazi.day}
时柱：${baziInfo.bazi.hour}

五行分析：${JSON.stringify(baziInfo.wuxingAnalysis)}
${baziInfo.lackingWuxing.length > 0 ? `缺少五行：${baziInfo.lackingWuxing.join('、')}` : '五行齐全'}

请解读其${readingTypeMap[readingType] || '综合运势'}。`;

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
        max_completion_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API错误:', response.status, errorText);
      throw new Error(`AI服务暂时不可用 (${response.status})`);
    }

    const aiData = await response.json();
    const reading = aiData.choices[0]?.message?.content;

    if (!reading) {
      throw new Error('AI解读生成失败');
    }

    // 保存解读记录
    const { error: saveError } = await supabase
      .from('ai_readings')
      .insert({
        user_id: user.id,
        bazi_record_id: baziRecordId,
        reading_type: readingType,
        content: reading,
      });

    if (saveError) {
      console.error('保存解读失败:', saveError);
    }

    return new Response(
      JSON.stringify({ success: true, reading }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI解读错误:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : '解读失败' 
      }),
      {
        status: error instanceof Error && error.message.includes('未授权') ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
