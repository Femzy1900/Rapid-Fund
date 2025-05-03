import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Replace this with your Netlify site URL
const PRODUCTION_URL = "https://rapidfund.netlify.app";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, amount, message = "", isAnonymous = false, donorInfo } = await req.json();

    if (!campaignId || !amount) {
      throw new Error("Campaign ID and amount are required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Determine base URL for redirect
    const originHeader = req.headers.get("origin");
    const isProduction = Deno.env.get("NODE_ENV") === "production";
    const baseUrl = isProduction ? PRODUCTION_URL : originHeader || "http://localhost:8080";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation",
              description: `Donation for campaign #${campaignId}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/donation-success?session_id={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}`,
      cancel_url: `${baseUrl}/campaigns/${campaignId}`,
      metadata: {
        campaignId,
        message,
        isAnonymous: isAnonymous.toString(),
        userId: donorInfo?.userId || "",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment session:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
