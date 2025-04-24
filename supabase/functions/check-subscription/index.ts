
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error('Error fetching user');

    // Get current subscription status
    const { data: subscriber } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!subscriber) {
      throw new Error('No subscription found');
    }

    // For trial users, just return the trial info
    if (subscriber.plan === 'trial') {
      return new Response(JSON.stringify({
        plan: 'trial',
        trial_ends_at: subscriber.trial_ends_at,
        is_active: new Date(subscriber.trial_ends_at) > new Date(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For paid subscribers, verify with Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    if (subscriber.stripe_subscription_id) {
      const subscription = await stripe.subscriptions.retrieve(subscriber.stripe_subscription_id);
      
      // Update subscription status in database
      await supabaseClient
        .from('subscribers')
        .update({
          is_active: subscription.status === 'active',
          subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({
        plan: subscriber.plan,
        is_active: subscription.status === 'active',
        subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
        platform_limits: subscriber.platform_limits,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      plan: subscriber.plan,
      is_active: false,
      subscription_ends_at: null,
      platform_limits: subscriber.platform_limits,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
