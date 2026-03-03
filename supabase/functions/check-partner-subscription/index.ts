import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PARTNER-SUB] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");
    logStep("User authenticated", { email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Customer found", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActive = subscriptions.data.length > 0;
    let productId = null;
    let priceId = null;
    let subscriptionEnd = null;

    if (hasActive) {
      const sub = subscriptions.data[0];
      const subItem = sub.items.data[0];
      productId = subItem.price.product;
      priceId = subItem.price.id;

      // In basil API, current_period_end moved to subscription item level
      const itemPeriodEnd = (subItem as any).current_period_end;
      logStep("Sub raw fields", {
        item_current_period_end: itemPeriodEnd,
        start_date: sub.start_date,
        created: sub.created,
        id: sub.id,
      });

      if (itemPeriodEnd && typeof itemPeriodEnd === 'number') {
        subscriptionEnd = new Date(itemPeriodEnd * 1000).toISOString();
      }

      let startedAt: string | null = null;
      const startTs = sub.start_date || sub.created;
      if (startTs && typeof startTs === 'number') {
        startedAt = new Date(startTs * 1000).toISOString();
      }

      logStep("Active subscription", { productId, priceId, subscriptionEnd, startedAt });

      const updatePayload: Record<string, any> = {
        subscription_status: "active",
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
      };
      if (startedAt) updatePayload.subscription_started_at = startedAt;
      if (subscriptionEnd) updatePayload.subscription_ends_at = subscriptionEnd;

      await supabaseClient
        .from("partners")
        .update(updatePayload)
        .eq("user_id", user.id);
    } else {
      logStep("No active subscription");
      // Update partner to reflect no subscription
      await supabaseClient
        .from("partners")
        .update({ subscription_status: "none" })
        .eq("user_id", user.id);
    }

    return new Response(JSON.stringify({
      subscribed: hasActive,
      product_id: productId,
      price_id: priceId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
