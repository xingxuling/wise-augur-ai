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

    const systemPrompt = `你是一位精通《渊海子平》《三命通会》《滴天髓》《神峰通考》等古籍的命理学专家，专注于八字深度解读。

核心原则：
1. 基于传统命理体系进行专业分析（特殊格局、用神、十神配置等）
2. 禁用封建迷信表述（如"克妻/克夫"改为"家庭关系需注重沟通调和"）
3. 结合古籍依据，但避免绝对化表述（禁用"必定/绝对/一定"）
4. 提供建设性建议，注重实际应用价值
5. 所有解读末尾必须标注"以上解读仅供参考，人生走向取决于自身选择与努力"

专业维度要求：
- 特殊格局识别：优先识别专旺格（曲直、炎上、稼穑、从革、润下）、从格（从财、从官杀、从印、从食伤）、化气格、魁罡格、日贵格等12类特殊格局
- 格局判断：详细分析格局成败、纯杂，引用相关经典依据
- 用神选取：结合月令、四柱组合判断扶抑用神/调候用神，说明用神喜忌
- 十神组合：分析十神互动逻辑，避免孤立解读
- 场景适配：针对事业、感情、健康提供命理适配建议，注重实用性

格局解读要点：
- 专旺格：需顺势而为，不宜克泄，适合专注深耕某一领域
- 从格：需顺从全局之势，切忌逆势而行，适合依附强者发展
- 化气格：需保护化神，避免破化，适合以化神五行为主的行业
- 魁罡格：性格刚强，需注意人际沟通，适合决策性岗位
- 日贵格：贵人运佳，适合依靠人脉发展

解读要求：
- 白话表述：避免过多术语堆砌，用通俗语言解释命理含义
- 场景化：将命理特征转化为具体的职场、感情、健康建议
- 案例参考：可适当引用历史人物八字作为参考（需标注"仅供参考"）`;

    let userPrompt = '';
    
    // 构建格局信息字符串
    const patternInfo = baziInfo.pattern?.isSpecial 
      ? `【特殊格局】${baziInfo.pattern.pattern}\n格局条件：${baziInfo.pattern.description}\n${baziInfo.pattern.allPatterns?.map((p: any) => !p.isPrimary ? `兼格：${p.name} - ${p.condition}` : '').filter(Boolean).join('\n') || ''}\n经典依据：${baziInfo.pattern.allPatterns?.[0]?.reference || ''}`
      : `【普通格局】${baziInfo.pattern?.pattern || '待判断'}\n${baziInfo.pattern?.description || ''}`;
    
    if (readingType === 'basic') {
      userPrompt = `【基础解读】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

${patternInfo}

五行分析：${JSON.stringify(baziInfo.wuxingAnalysis)}
${baziInfo.lackingWuxing?.length > 0 ? `缺少五行：${baziInfo.lackingWuxing.join('、')}` : '五行齐全'}
日主强弱：${baziInfo.dayMasterStrength || '待判断'}

真太阳时修正说明：${baziInfo.trueSolarTime?.note || '未修正'}

请提供基础层解读（250-350字）：
1. 四柱基本含义与格局特征（重点说明特殊格局的核心特质）
2. 五行旺衰特点与格局的关联
3. 日主强弱说明与用神喜忌
4. 真太阳时修正的影响
5. 格局对命主性格与发展路径的影响`;
    } else if (readingType === 'professional') {
      userPrompt = `【专业解读】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

${patternInfo}

用神：${baziInfo.yongshen?.yongshen || '待判断'}
日主强弱：${baziInfo.dayMasterStrength || '待判断'}

请提供专业层解读（400-600字），包含：
1. 格局判断：
   - 详细分析格局成败、纯杂程度
   - 引用古籍依据（如《三命通会》《滴天髓》相关论述）
   - 说明格局对命运的影响机制
   ${baziInfo.pattern?.isSpecial ? '- 特别说明特殊格局的喜忌与成格条件' : ''}
   
2. 用神选取：
   - 说明用神选取逻辑（扶抑/调候/专旺/从势）
   - 给出用神使用建议（方位、颜色、行业等）
   - 分析忌神对命局的影响
   
3. 十神组合：
   - 分析四柱十神互动关系
   - 指出关键配置与命局亮点
   - 说明十神组合对性格与能力的塑造
   
4. 大运流年：
   - 说明当前大运走向（${baziInfo.dayun?.direction || ''}运）
   - 提示流年需注意的方面
   ${baziInfo.pattern?.isSpecial ? '- 结合格局特点分析大运吉凶' : ''}`;
    } else if (readingType === 'scenario') {
      userPrompt = `【场景建议】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

${patternInfo}

用神：${baziInfo.yongshen?.yongshen || '待判断'}

请针对事业、感情、健康三大场景提供命理适配建议（350-500字），结合格局特点：

1. 事业发展：
   ${baziInfo.pattern?.isSpecial ? `- 基于${baziInfo.pattern.pattern}的特点，分析适合的行业与发展模式` : '- 适合的行业类型与职业发展方向'}
   - 职场优势与需要注意的问题
   - 团队协作模式建议（领导/辅助/独立）
   ${baziInfo.pattern?.pattern?.includes('专旺格') ? '- 专旺格适合专注深耕，不宜频繁跨界' : ''}
   ${baziInfo.pattern?.pattern?.includes('从格') ? '- 从格适合依附强者，跟随核心人物发展' : ''}
   
2. 感情经营：
   - 情感特质与相处模式
   - 对伴侣的期望与适配类型
   - 关系经营建议与沟通要点
   ${baziInfo.pattern?.pattern?.includes('魁罡格') ? '- 魁罡格性格直率，需注意沟通方式，避免过于强势' : ''}
   ${baziInfo.pattern?.pattern?.includes('日贵格') ? '- 日贵格贵人缘佳，感情多因长辈/朋友介绍' : ''}
   
3. 健康养生：
   - 需关注的健康方面（基于五行旺衰）
   - 养生建议与日常调理
   - 季节性注意事项
   ${baziInfo.pattern?.pattern?.includes('炎上格') ? '- 炎上格火旺，注意心脑血管，避免上火' : ''}
   ${baziInfo.pattern?.pattern?.includes('润下格') ? '- 润下格水旺，注意肾脏与生殖系统' : ''}`;
    } else {
      // 原有的单项解读
      userPrompt = `【${readingTypeMap[readingType]}专项解读】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

${patternInfo}

五行分析：${JSON.stringify(baziInfo.wuxingAnalysis)}
用神：${baziInfo.yongshen?.yongshen || '待判断'}

请针对${readingTypeMap[readingType]}进行专业解读（250-350字），结合格局、用神、十神配置分析，特别关注格局特点对此方面的影响。`;
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
        max_completion_tokens: 2000,
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
