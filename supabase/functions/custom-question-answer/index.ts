import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY未配置");
      throw new Error("AI服务未配置");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 获取问题详情
    const { data: question, error: questionError } = await supabase
      .from("custom_questions")
      .select(`
        *,
        bazi_record:bazi_records(*)
      `)
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      console.error("获取问题失败:", questionError);
      throw new Error("问题不存在");
    }

    // 输入验证：防止超长问题导致AI API成本攻击
    if (!question.question || question.question.length < 10 || question.question.length > 500) {
      return new Response(
        JSON.stringify({ error: '问题长度必须在10-500字符之间' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 速率限制检查：防止API滥用
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
    const { data: recentUsage, error: usageError } = await supabase
      .from('ai_usage_records')
      .select('created_at')
      .eq('user_id', question.bazi_record.user_id)
      .gte('created_at', oneMinuteAgo);

    if (usageError) {
      console.error('检查使用记录失败:', usageError);
    }

    // 获取用户会员等级
    const { data: membershipData } = await supabase
      .from('user_memberships')
      .select('tier')
      .eq('user_id', question.bazi_record.user_id)
      .single();
    
    const membershipTier = membershipData?.tier || 'free';

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

    // 获取八字数据
    const baziData = question.bazi_record.result;

    // 验证八字数据结构
    if (!baziData || !baziData.bazi) {
      console.error("八字数据结构不完整:", baziData);
      throw new Error("八字数据不完整，无法生成解读");
    }

    const bazi = baziData.bazi;
    
    // 提取场景信息
    const sceneType = question.scene_type || "general";
    const sceneCategory = question.scene_category || "";

    // 场景标签映射
    const sceneLabels: Record<string, string> = {
      'career': '职场发展',
      'love': '感情婚姻',
      'wealth': '财运财富',
      'health': '健康养生',
      'education': '学业深造'
    };

    // 构建系统提示词
    const systemPrompt = `你是一位专业的八字命理师。用户的八字信息如下：

【基本八字】
年柱：${bazi.year || ''}
月柱：${bazi.month || ''}
日柱：${bazi.day || ''}
时柱：${bazi.hour || ''}

【格局信息】
${baziData.pattern ? `格局：${baziData.pattern.pattern}
格局说明：${baziData.pattern.description}` : "普通格局"}

【五行分析】
${baziData.wuxingAnalysis ? Object.entries(baziData.wuxingAnalysis).map(([key, value]) => `${key}：${value}`).join('\n') : ''}

用户咨询的场景是：${sceneLabels[sceneType] || sceneType}
具体分类：${sceneCategory}

请根据用户的八字和场景，提供专业、具体、可行的解读建议。

你的回答必须包含以下结构：

【核心建议】（3个）
1. [第一条建议]：具体可行的行动建议，结合八字特点
2. [第二条建议]：从不同角度提供补充建议
3. [第三条建议]：长期规划或策略性建议

【风险提示】（2个）
1. [第一个风险]：需要特别注意的潜在问题
2. [第二个风险]：可能遇到的挑战或阻碍

【立即行动】（1个）
具体的、可在本周内执行的行动步骤

回答要求：
- 白话易懂，避免晦涩术语
- 每条建议具体可行，避免泛泛而谈
- 紧密结合用户的场景类型，不要偏离主题
- 语气温和专业，给用户信心
- 适当引用八字特征来支撑建议
- 总字数控制在500-800字之间`;

    console.log("开始调用AI生成定制解读，问题ID:", questionId);

    // 调用AI生成回答
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question.question },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API错误:", response.status, errorText);
      throw new Error("AI生成失败");
    }

    const aiResult = await response.json();
    const answer = aiResult.choices[0].message.content;

    console.log("AI生成成功，更新数据库");

    // 更新问题状态
    const { error: updateError } = await supabase
      .from("custom_questions")
      .update({
        answer,
        status: "answered",
        answered_at: new Date().toISOString(),
      })
      .eq("id", questionId);

    if (updateError) {
      console.error("更新问题失败:", updateError);
      throw updateError;
    }

    console.log("定制解读生成成功:", questionId);

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        questionId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("处理失败:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "未知错误"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
