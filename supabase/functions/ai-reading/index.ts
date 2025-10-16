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

    const { baziRecordId, readingType, userId } = await req.json();

    if (!baziRecordId || !readingType) {
      throw new Error('缺少必要参数');
    }

    // 获取用户会员等级
    const { data: membershipData } = await supabase
      .from('user_memberships')
      .select('tier')
      .eq('user_id', user.id)
      .single();
    
    const membershipTier = membershipData?.tier || 'free';

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

    // 提取格局类型以匹配典籍和案例
    const baziInfo = baziRecord.result;
    const patternType = baziInfo.pattern?.pattern || '普通格局';
    
    // 根据解读类型确定场景标签
    let scenarioTags: string[] = [];
    if (readingType === 'career') {
      scenarioTags = ['职场'];
    } else if (readingType === 'love') {
      scenarioTags = ['感情'];
    } else if (readingType === 'health') {
      scenarioTags = ['健康'];
    } else if (readingType === 'wealth') {
      scenarioTags = ['财运', '创业'];
    }

    // 获取相关经典典籍引用
    const textsLimit = membershipTier === 'free' ? 1 : 2;
    const { data: classicTexts } = await supabase
      .from('classic_texts')
      .select('*')
      .or(`keyword.ilike.%${patternType}%,keyword.ilike.%格局%`)
      .limit(textsLimit);

    // 获取匹配的案例
    const casesLimit = membershipTier === 'free' ? 1 : (membershipTier === 'basic' ? 2 : 3);
    let casesQuery = supabase
      .from('bazi_cases')
      .select('*')
      .eq('is_verified', true)
      .eq('pattern_type', patternType);
    
    if (scenarioTags.length > 0) {
      casesQuery = casesQuery.overlaps('scenario_tags', scenarioTags);
    }
    
    const { data: similarCases } = await casesQuery
      .order('helpful_votes', { ascending: false })
      .limit(casesLimit);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('AI服务未配置');
    }

    // 速率限制检查：防止API滥用
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentUsage, error: usageError } = await supabase
      .from('ai_usage_records')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneMinuteAgo);

    if (usageError) {
      console.error('检查使用记录失败:', usageError);
    }

    // 根据会员等级设置速率限制
    const rateLimits: Record<string, number> = {
      free: 3,
      basic: 5,
      premium: 10
    };
    const limit = rateLimits[membershipTier] || rateLimits.free;

    if (recentUsage && recentUsage.length >= limit) {
      throw new Error(`速率限制：${membershipTier}会员每分钟最多${limit}次AI解读请求，请稍后再试`);
    }

    // 构建典籍引用部分
    let classicReferences = '';
    if (classicTexts && classicTexts.length > 0) {
      classicReferences = '\n\n【经典依据】\n' + classicTexts.map((text: any) => 
        `《${text.book_name}·${text.chapter}》云："${text.original_text}"
现代解读：${text.modern_interpretation}`
      ).join('\n\n');
    }

    // 构建案例参考部分
    let caseReferences = '';
    if (similarCases && similarCases.length > 0) {
      caseReferences = '\n\n【类似案例参考】\n' + similarCases.map((c: any, index: number) => {
        const feedbackInfo = c.user_feedback 
          ? `\n用户反馈：${c.user_feedback}（反馈时间：${new Date(c.feedback_time).toLocaleDateString('zh-CN')}）`
          : '';
        
        return `案例${index + 1}（${c.case_code}）：
基本信息：${c.gender}，${c.age_range}，${c.region}，${c.identity}
咨询问题：${c.consultation_question}
系统解读：${c.system_reading}${feedbackInfo}
投票：${c.helpful_votes}人认为有用`;
      }).join('\n\n');
    }

    // 构建提示词
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
2. **必须引用经典典籍作为依据**，使用"据《典籍名》"的格式
3. 结合古籍依据，但避免绝对化表述（禁用"必定/绝对/一定"）
4. 提供建设性建议，注重实际应用价值
5. 所有解读末尾必须标注"以上解读仅供参考，人生走向取决于自身选择与努力"

**已为您准备的典籍资料：**${classicReferences}

**已为您准备的同类案例：**${caseReferences}

专业维度要求：
- 特殊格局识别：优先识别专旺格、从格、化气格、魁罡格、日贵格等特殊格局
- 格局判断：详细分析格局成败、纯杂，**引用相关经典依据**
- 用神选取：结合月令、四柱组合判断扶抑用神/调候用神，说明用神喜忌
- 十神组合：分析十神互动逻辑，避免孤立解读
- 场景适配：针对事业、感情、健康提供命理适配建议，注重实用性
- **案例参考**：自然融入同类案例作为参考，增强解读可信度

解读要求：
- 白话表述：避免过多术语堆砌，用通俗语言解释命理含义
- 场景化：将命理特征转化为具体的职场、感情、健康建议
- 引用经典：在关键判断处引用典籍原文，格式为"据《典籍名·章节》：'原文'"
- 参考案例：适当提及同类案例的经验，格式为"参考案例显示..."
- 保持客观：不做过度夸张的预言，所有建议需可操作

请在解读中自然融入以上典籍引用和案例参考，增强解读的专业性和可信度。`;

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

请提供基础层解读（250-350字），**必须引用准备的典籍**：
1. 四柱基本含义与格局特征（引用典籍说明格局核心特质）
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

请提供专业层解读（400-600字），**必须引用准备的典籍和案例**：
1. 格局判断：
   - 详细分析格局成败、纯杂程度
   - **引用古籍依据**（使用准备的典籍资料）
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
   
4. **参考案例**：结合准备的同类案例，说明类似格局的实际发展情况`;
    } else if (readingType === 'scenario') {
      userPrompt = `【场景建议】
八字四柱：
年柱：${baziInfo.bazi.year}（${baziInfo.shishenAnalysis?.year?.gan || ''}）
月柱：${baziInfo.bazi.month}（${baziInfo.shishenAnalysis?.month?.gan || ''}）
日柱：${baziInfo.bazi.day}（日主）
时柱：${baziInfo.bazi.hour}（${baziInfo.shishenAnalysis?.hour?.gan || ''}）

${patternInfo}

用神：${baziInfo.yongshen?.yongshen || '待判断'}

请针对事业、感情、健康三大场景提供命理适配建议（350-500字），**结合典籍和案例**：

1. 事业发展：
   ${baziInfo.pattern?.isSpecial ? `- 基于${baziInfo.pattern.pattern}的特点，分析适合的行业与发展模式（引用典籍和案例）` : '- 适合的行业类型与职业发展方向'}
   - 职场优势与需要注意的问题
   - 团队协作模式建议（领导/辅助/独立）
   
2. 感情经营：
   - 情感特质与相处模式
   - 对伴侣的期望与适配类型
   - 关系经营建议与沟通要点
   
3. 健康养生：
   - 需关注的健康方面（基于五行旺衰）
   - 养生建议与日常调理
   - 季节性注意事项`;
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

请针对${readingTypeMap[readingType]}进行专业解读（250-350字），**引用典籍和案例**，结合格局、用神、十神配置分析。`;
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
    const userIdToUse = userId || user.id;
    const { error: saveError } = await supabase
      .from('ai_readings')
      .insert({
        user_id: userIdToUse,
        bazi_record_id: baziRecordId,
        reading_type: readingType,
        content: reading,
      });

    if (saveError) {
      console.error('保存解读失败:', saveError);
    }

    // 记录AI使用次数
    const { error: usageError } = await supabase
      .from('ai_usage_records')
      .insert({
        user_id: userIdToUse,
        usage_type: 'ai_reading',
        bazi_record_id: baziRecordId,
      });

    if (usageError) {
      console.error('记录使用次数失败:', usageError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        reading,
        classicTexts: classicTexts || [],
        similarCases: similarCases || []
      }),
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
