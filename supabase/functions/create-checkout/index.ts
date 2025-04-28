
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BASIC_PRICE_EUR = 799; // 7.99€
const AGENCY_PRICE_EUR = 1899; // 18.99€

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Get user data
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error('Error fetching user');

    // Parse request body
    const { plan } = await req.json();
    if (!plan || !['basic', 'agency'].includes(plan)) {
      throw new Error('Invalid plan selected');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    // Check if customer exists
    let customerId;
    const { data: customers } = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.length > 0) {
      customerId = customers[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Store Stripe customer ID in user metadata
    await supabaseClient.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        stripe_customer_id: customerId,
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
            description: plan === 'basic' ? 
              'Unlimited videos, 2 accounts per platform' : 
              'Unlimited videos, 10 accounts per platform',
          },
          unit_amount: plan === 'basic' ? BASIC_PRICE_EUR : AGENCY_PRICE_EUR,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }],
      success_url: `${req.headers.get('origin')}/settings/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/settings/subscription`,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
