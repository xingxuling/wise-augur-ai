import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    console.log("User authenticated", { userId: user.id, email: user.email });

    // 获取用户的会员信息
    const { data: membership, error: membershipError } = await supabaseClient
      .from('user_memberships')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (membershipError) throw new Error(`Failed to fetch membership: ${membershipError.message}`);
    
    if (!membership?.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ error: "No active subscription found" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Found subscription", { subscriptionId: membership.stripe_subscription_id });

    // 取消Stripe订阅（不立即取消，在当前周期结束时取消）
    const Stripe = (await import("https://esm.sh/stripe@18.5.0")).default;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const subscription = await stripe.subscriptions.update(
      membership.stripe_subscription_id,
      {
        cancel_at_period_end: true, // 在当前计费周期结束时取消
      }
    );

    console.log("Subscription cancelled", { subscriptionId: subscription.id });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription will be cancelled at the end of the current billing period",
        subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});