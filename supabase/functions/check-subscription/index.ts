
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for better logging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
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
    logStep("Authenticating user with token");
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) throw new Error('Error fetching user');
    
    logStep("User authenticated", { id: user.id, email: user.email });

    // Get current subscription status
    const { data: subscriber, error: subscriberError } = await supabaseClient
      .from('subscribers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (subscriberError && subscriberError.code !== 'PGRST116') {
      logStep("Error fetching subscriber data", { error: subscriberError });
      throw new Error('Error fetching subscription data');
    }

    if (!subscriber) {
      logStep("No subscription found for user");
      return new Response(JSON.stringify({
        plan: 'trial',
        is_active: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep("Found subscriber data", { 
      plan: subscriber.plan, 
      active: subscriber.is_active,
      stripe_subscription: subscriber.stripe_subscription_id
    });

    // For trial users, just return the trial info
    if (subscriber.plan === 'trial') {
      const is_trial_active = new Date(subscriber.trial_ends_at) > new Date();
      logStep("User on trial plan", { 
        trial_ends_at: subscriber.trial_ends_at, 
        is_active: is_trial_active 
      });
      
      return new Response(JSON.stringify({
        plan: 'trial',
        trial_ends_at: subscriber.trial_ends_at,
        is_active: is_trial_active,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For paid subscribers, verify with Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
    });

    if (subscriber.stripe_subscription_id) {
      logStep("Verifying subscription with Stripe", { subscription_id: subscriber.stripe_subscription_id });
      
      try {
        const subscription = await stripe.subscriptions.retrieve(subscriber.stripe_subscription_id);
        logStep("Retrieved subscription from Stripe", { 
          status: subscription.status,
          current_period_end: subscription.current_period_end
        });
        
        // Define platform limits based on plan
        let platformLimits = {
          tiktok: 2,
          youtube: 2,
          instagram: 2,
          facebook: 2,
          pinterest: 2,
          dropbox: 2,
          google_drive: 2
        };
        
        if (subscriber.plan === "agency") {
          platformLimits = {
            tiktok: 10,
            youtube: 10,
            instagram: 10,
            facebook: 10,
            pinterest: 10,
            dropbox: 10,
            google_drive: 10
          };
        }
        
        // Update subscription status in database
        const { error: updateError } = await supabaseClient
          .from('subscribers')
          .update({
            is_active: subscription.status === 'active',
            subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
            platform_limits: platformLimits,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) {
          logStep("Error updating subscriber status", { error: updateError });
        } else {
          logStep("Updated subscriber status in database");
        }

        return new Response(JSON.stringify({
          plan: subscriber.plan,
          is_active: subscription.status === 'active',
          subscription_ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
          platform_limits: platformLimits,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (stripeError) {
        logStep("Error retrieving subscription from Stripe", { error: stripeError });
        
        // If the subscription doesn't exist in Stripe anymore, mark it as inactive
        const { error: updateError } = await supabaseClient
          .from('subscribers')
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (updateError) {
          logStep("Error updating subscriber status after Stripe error", { error: updateError });
        }
        
        return new Response(JSON.stringify({
          plan: subscriber.plan,
          is_active: false,
          platform_limits: subscriber.platform_limits,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // If we reach here, user has a plan but no active Stripe subscription
    logStep("User has a plan but no valid Stripe subscription");
    return new Response(JSON.stringify({
      plan: subscriber.plan,
      is_active: false,
      platform_limits: subscriber.platform_limits,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("Error processing request", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
