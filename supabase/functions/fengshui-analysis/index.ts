import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const HOUSE_TYPE_LABELS: Record<string, string> = {
  apartment: '公寓',
  house: '独栋住宅',
  villa: '别墅',
  office: '办公室',
  shop: '商铺',
};

const DIRECTION_LABELS: Record<string, string> = {
  north: '正北(坐北朝南)',
  northeast: '东北(坐东北朝西南)',
  east: '正东(坐东朝西)',
  southeast: '东南(坐东南朝西北)',
  south: '正南(坐南朝北)',
  southwest: '西南(坐西南朝东北)',
  west: '正西(坐西朝东)',
  northwest: '西北(坐西北朝东南)',
};

const ANALYSIS_TYPE_LABELS: Record<string, string> = {
  general: '整体风水',
  bedroom: '卧室布局',
  living: '客厅布局',
  office: '办公室布局',
  wealth: '财位分析',
  health: '健康位分析',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, houseType, direction, analysisType, floor, buildYear, description } = await req.json();

    if (!userId || !houseType || !direction || !analysisType) {
      return new Response(
        JSON.stringify({ success: false, error: '缺少必要参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查用户会员权限
    const { data: membership } = await supabaseClient
      .from('user_memberships')
      .select('tier')
      .eq('user_id', userId)
      .single();

    if (!membership || membership.tier === 'free') {
      return new Response(
        JSON.stringify({ success: false, error: '风水测算需要基础版及以上会员' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 构建分析提示词
    const houseInfo = `
房屋类型：${HOUSE_TYPE_LABELS[houseType]}
房屋朝向：${DIRECTION_LABELS[direction]}
分析类型：${ANALYSIS_TYPE_LABELS[analysisType]}
${floor ? `楼层：${floor}层` : ''}
${buildYear ? `建造年份：${buildYear}年` : ''}
${description ? `详细描述：${description}` : ''}
`.trim();

    const systemPrompt = `你是一位资深的风水大师，精通传统风水理论，包括八宅风水、玄空飞星、峦头理气等流派。
你需要基于用户提供的房屋信息，提供专业、实用的风水分析和改善建议。

分析要求：
1. 结合房屋朝向、类型等信息，分析其风水格局
2. 根据分析类型(整体/卧室/客厅/财位/健康位等)，提供针对性建议
3. 说明该方位的五行属性、吉凶特点
4. 提供具体可行的布局优化方案
5. 建议适合摆放的物品或颜色搭配
6. 语言通俗易懂，避免过度专业术语
7. 保持客观中立，提供建设性意见

请以专业但易懂的方式，为用户生成详细的风水分析报告。`;

    const userPrompt = `请为以下房屋进行风水分析：

${houseInfo}

请提供详细的风水分析和改善建议。`;

    // 调用 AI 生成分析
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI 分析服务暂时不可用');
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0]?.message?.content;

    if (!analysis) {
      throw new Error('未能生成分析结果');
    }

    // 记录分析历史
    await supabaseClient
      .from('fengshui_records')
      .insert({
        user_id: userId,
        house_type: houseType,
        direction: direction,
        analysis_type: analysisType,
        floor: floor ? parseInt(floor) : null,
        build_year: buildYear ? parseInt(buildYear) : null,
        description: description,
        analysis_result: analysis,
      });

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('风水分析错误:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : '分析失败，请稍后重试'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
