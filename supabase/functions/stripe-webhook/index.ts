import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Missing signature or webhook secret" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const metadata = session.metadata;

        if (!userId || !metadata) break;

        // 创建订阅记录
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const { error: subError } = await supabaseClient
          .from("subscriptions")
          .insert({
            user_id: userId,
            plan: metadata.plan_type,
            status: "active",
            expires_at: expiresAt.toISOString(),
            region: metadata.region,
            payment_method: "stripe",
            currency: session.currency?.toUpperCase() || "USD",
          });

        if (subError) {
          console.error("Error creating subscription:", subError);
        }

        // 创建支付记录
        const { error: payError } = await supabaseClient
          .from("payment_records")
          .insert({
            user_id: userId,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || "USD",
            payment_method: "stripe",
            payment_status: "completed",
            transaction_id: session.payment_intent as string,
            region: metadata.region,
          });

        if (payError) {
          console.error("Error creating payment record:", payError);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (!userId) break;

        // 更新订阅状态
        await supabaseClient
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("user_id", userId)
          .eq("status", "active");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const userId = invoice.subscription_details?.metadata?.user_id;

        if (!userId) break;

        // 标记支付失败
        await supabaseClient
          .from("payment_records")
          .update({ payment_status: "failed" })
          .eq("transaction_id", invoice.payment_intent as string);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
