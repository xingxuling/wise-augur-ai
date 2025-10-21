import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { referralCode, newUserId } = await req.json();

    if (!referralCode || !newUserId) {
      return new Response(
        JSON.stringify({ error: 'Missing referralCode or newUserId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 查找推荐码
    const { data: referralCodeData, error: codeError } = await supabaseClient
      .from('referral_codes')
      .select('id, user_id, uses_count, max_uses')
      .eq('code', referralCode)
      .single();

    if (codeError || !referralCodeData) {
      console.error('推荐码不存在:', codeError);
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查推荐码是否可用
    if (referralCodeData.max_uses && referralCodeData.uses_count >= referralCodeData.max_uses) {
      return new Response(
        JSON.stringify({ error: 'Referral code expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 检查是否已经使用过该推荐码
    const { data: existingReward } = await supabaseClient
      .from('referral_rewards')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single();

    if (existingReward) {
      return new Response(
        JSON.stringify({ error: 'Referral already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 创建推荐奖励记录
    const { error: rewardError } = await supabaseClient
      .from('referral_rewards')
      .insert({
        referrer_id: referralCodeData.user_id,
        referred_user_id: newUserId,
        referral_code_id: referralCodeData.id,
        reward_type: 'ai_reading',
        reward_count: 3,
        used_count: 0,
      });

    if (rewardError) {
      console.error('创建奖励记录失败:', rewardError);
      throw rewardError;
    }

    // 更新推荐码使用次数
    const { error: updateError } = await supabaseClient
      .from('referral_codes')
      .update({ uses_count: referralCodeData.uses_count + 1 })
      .eq('id', referralCodeData.id);

    if (updateError) {
      console.error('更新推荐码使用次数失败:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Referral processed successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('处理推荐失败:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
