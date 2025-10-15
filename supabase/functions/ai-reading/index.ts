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
      basic: '基础解读',
      professional: '专业解读',
      scenario: '场景建议'
    };

    const systemPrompt = `你是一位精通《渊海子平》《三命通会》《神峰通考》等古籍的命理学专家，专注于八字深度解读。

核心原则：
1. 基于传统命理体系进行专业分析（格局、用神、十神配置等）
2. 禁用封建迷信表述（如"克妻/克夫"改为"家庭关系需注重沟通调和"）
3. 结合古籍依据，但避免绝对化表述（禁用"必定/绝对/一定"）
4. 提供建设性建议，注重实际应用价值
5. 标注"仅供参考，人生决策请结合实际判断"

专业维度要求：
- 格局判断：识别12种主流格局，标注格局成败
- 用神选取：结合月令、四柱组合判断扶抑用神/调候用神
- 十神组合：分析十神互动逻辑，避免孤立解读
- 场景适配：针对事业、感情、健康提供命理适配建议`;

    let userPrompt = '';
    
    if (readingType === 'basic') {
      userPrompt = `【基础解读】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

五行分析：${JSON.stringify(baziInfo.wuxingAnalysis)}
${baziInfo.lackingWuxing?.length > 0 ? `缺少五行：${baziInfo.lackingWuxing.join('、')}` : '五行齐全'}
日主强弱：${baziInfo.dayMasterStrength || '待判断'}

真太阳时修正说明：${baziInfo.trueSolarTime?.note || '未修正'}

请提供基础层解读（200-300字）：
1. 四柱基本含义
2. 五行旺衰特点
3. 日主强弱说明
4. 真太阳时修正的影响`;
    } else if (readingType === 'professional') {
      userPrompt = `【专业解读】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

格局：${baziInfo.pattern?.pattern || '待判断'}
用神：${baziInfo.yongshen?.yongshen || '待判断'}
日主强弱：${baziInfo.dayMasterStrength || '待判断'}

请提供专业层解读（300-500字），包含：
1. 格局判断：分析格局成败，引用古籍依据（如《神峰通考》相关论述）
2. 用神选取：说明用神选取逻辑（扶抑/调候），并给出使用建议
3. 十神组合：分析四柱十神互动关系，指出关键配置
4. 大运流年：说明当前大运走向，提示流年需注意的方面`;
    } else if (readingType === 'scenario') {
      userPrompt = `【场景建议】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

格局：${baziInfo.pattern?.pattern || '待判断'}
用神：${baziInfo.yongshen?.yongshen || '待判断'}

请针对事业、感情、健康三大场景提供命理适配建议（250-400字）：
1. 事业：适合的行业类型、职业发展方向、需注意的职场问题
2. 感情：情感特质、相处模式、关系经营建议
3. 健康：需关注的健康方面、养生建议`;
    } else {
      // 原有的单项解读
      userPrompt = `【${readingTypeMap[readingType]}专项解读】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

五行分析：${JSON.stringify(baziInfo.wuxingAnalysis)}
格局：${baziInfo.pattern?.pattern || '待判断'}
用神：${baziInfo.yongshen?.yongshen || '待判断'}

请针对${readingTypeMap[readingType]}进行专业解读（200-300字），结合格局、用神、十神配置分析。`;
    }

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
