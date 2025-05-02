
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = "https://gwsxbdawaroetboddxme.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }
    
    // Initialize Stripe with the secret key
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    
    // Create a Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Retrieve the session to confirm payment was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }
    
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const campaignId = session.metadata?.campaignId;
    const message = session.metadata?.message || "";
    const isAnonymous = session.metadata?.isAnonymous === "true";
    const userId = session.metadata?.userId || null;
    
    // Create the donation record in Supabase
    const { data, error } = await supabase
      .from("donations")
      .insert({
        campaign_id: campaignId,
        user_id: userId || null,
        amount,
        message,
        is_anonymous: isAnonymous,
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating donation: ${error.message}`);
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      donation: data 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Error processing donation:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
