
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }
  
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    console.error("No Stripe signature found");
    return new Response(JSON.stringify({ error: "No Stripe signature found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  
  try {
    const body = await req.text();
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Handle the event
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      
      // Only process subscription invoices
      if (invoice.subscription && invoice.customer) {
        const customerId = invoice.customer;
        const invoiceId = invoice.id;
        const amountPaid = invoice.amount_paid / 100; // Convert from cents
        const currency = invoice.currency;
        
        // Log the details for debugging
        console.log(`Processing payment: Customer ${customerId} paid ${amountPaid} ${currency} with invoice ${invoiceId}`);
        
        // Record commission using our database function
        const { data, error } = await supabase.rpc('record_commission', {
          invoice_id: invoiceId,
          customer_id: customerId,
          amount: amountPaid,
          currency: currency
        });
        
        if (error) {
          console.error("Error recording commission:", error);
          return new Response(JSON.stringify({ error: "Error recording commission" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
        
        console.log("Commission recorded successfully:", data);
      }
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: `Server Error: ${err.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
