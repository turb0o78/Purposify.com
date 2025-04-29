
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Fonction d'aide pour la journalisation
const logEvent = (message: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${message}${detailsStr}`);
};

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
    logEvent("No Stripe signature found");
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
      logEvent("Webhook event constructed", { type: event.type });
    } catch (err) {
      logEvent(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });
    
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSession(event.data.object, supabase);
        break;
        
      case "invoice.payment_succeeded":
        await handleInvoicePayment(event.data.object, supabase);
        break;
        
      case "customer.subscription.updated":
      case "customer.subscription.created":
        await handleSubscriptionUpdate(event.data.object, supabase);
        break;
        
      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object, supabase);
        break;
        
      default:
        logEvent(`Unhandled event type: ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    logEvent(`Error processing webhook: ${err.message}`);
    return new Response(JSON.stringify({ error: `Server Error: ${err.message}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

// Gestion de la session de paiement complétée
async function handleCheckoutSession(session: any, supabase: any) {
  try {
    logEvent("Processing checkout session completion", { session_id: session.id });
    
    // Si c'est une session d'abonnement et qu'elle est payée
    if (session.mode === "subscription" && session.payment_status === "paid") {
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan || "basic";
      
      logEvent("Subscription checkout completed", {
        customer_id: customerId,
        subscription_id: subscriptionId,
        user_id: userId,
        plan: plan
      });

      if (customerId && subscriptionId) {
        // Récupérer les détails de l'abonnement
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const period_end = new Date(subscription.current_period_end * 1000).toISOString();
        
        // Mettre à jour l'abonné dans la base de données
        await updateSubscriber(supabase, userId, customerId, subscriptionId, plan, period_end);
      }
    }
  } catch (error) {
    logEvent(`Error in handleCheckoutSession: ${error.message}`, { error });
  }
}

// Gestion du paiement de facture réussi
async function handleInvoicePayment(invoice: any, supabase: any) {
  try {
    logEvent("Processing invoice payment", { 
      invoice_id: invoice.id,
      customer: invoice.customer,
      subscription: invoice.subscription,
      amount_paid: invoice.amount_paid 
    });
    
    if (invoice.subscription && invoice.customer) {
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;
      const invoiceId = invoice.id;
      const amountPaid = invoice.amount_paid / 100; // Convert from cents
      const currency = invoice.currency;
      
      // Récupérer le client Stripe pour obtenir les métadonnées
      const customer = await stripe.customers.retrieve(customerId);
      
      // Récupérer l'abonnement pour voir les détails supplémentaires si nécessaire
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      // Trouver l'utilisateur associé au customerId dans la base de données
      const { data: subscribers, error: subscribersError } = await supabase
        .from('subscribers')
        .select('user_id, plan')
        .eq('stripe_customer_id', customerId)
        .limit(1);
      
      if (subscribersError) {
        throw new Error(`Error finding subscriber: ${subscribersError.message}`);
      }
      
      if (subscribers && subscribers.length > 0) {
        const userId = subscribers[0].user_id;
        const plan = subscribers[0].plan;
        
        logEvent("Found subscriber for invoice", { user_id: userId, plan });
        
        // Mettre à jour la période d'abonnement
        const period_end = new Date(subscription.current_period_end * 1000).toISOString();
        await updateSubscriber(supabase, userId, customerId, subscriptionId, plan, period_end);
        
        // Enregistrer la commission si c'est une facture récurrente pour un abonnement
        const { data: commissionResult, error: commissionError } = await supabase.rpc('record_commission', {
          invoice_id: invoiceId,
          customer_id: customerId,
          amount: amountPaid,
          currency: currency
        });
        
        if (commissionError) {
          logEvent("Error recording commission", { error: commissionError });
        } else {
          logEvent("Commission recorded", { result: commissionResult });
        }
      } else {
        logEvent("No subscriber found for customer ID", { customer_id: customerId });
      }
    }
  } catch (error) {
    logEvent(`Error in handleInvoicePayment: ${error.message}`, { error });
  }
}

// Gestion des mises à jour d'abonnement
async function handleSubscriptionUpdate(subscription: any, supabase: any) {
  try {
    logEvent("Processing subscription update", { 
      subscription_id: subscription.id,
      status: subscription.status,
      customer: subscription.customer 
    });
    
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const isActive = subscription.status === 'active';
    const period_end = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Trouver l'abonné dans la base de données
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('user_id, plan')
      .eq('stripe_customer_id', customerId)
      .limit(1);
    
    if (subscribersError) {
      throw new Error(`Error finding subscriber: ${subscribersError.message}`);
    }
    
    if (subscribers && subscribers.length > 0) {
      const userId = subscribers[0].user_id;
      
      // Déterminer le plan en fonction du prix
      let plan = subscribers[0].plan;
      if (subscription.items?.data?.length) {
        const priceId = subscription.items.data[0].price.id;
        const price = await stripe.prices.retrieve(priceId);
        const amount = price.unit_amount || 0;
        
        if (amount <= 799) {
          plan = "basic";
        } else if (amount <= 1899) {
          plan = "agency";
        }
        
        logEvent("Determined plan from price", { price_id: priceId, amount, plan });
      }
      
      await updateSubscriber(supabase, userId, customerId, subscriptionId, plan, period_end, isActive);
    } else {
      logEvent("No subscriber found for subscription update", { customer_id: customerId });
    }
  } catch (error) {
    logEvent(`Error in handleSubscriptionUpdate: ${error.message}`, { error });
  }
}

// Gestion des annulations d'abonnement
async function handleSubscriptionCancelled(subscription: any, supabase: any) {
  try {
    logEvent("Processing subscription cancellation", { subscription_id: subscription.id });
    
    const customerId = subscription.customer;
    
    // Trouver l'abonné dans la base de données
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('user_id, plan')
      .eq('stripe_customer_id', customerId)
      .limit(1);
    
    if (subscribersError) {
      throw new Error(`Error finding subscriber: ${subscribersError.message}`);
    }
    
    if (subscribers && subscribers.length > 0) {
      const userId = subscribers[0].user_id;
      const plan = subscribers[0].plan;
      
      // Marquer l'abonnement comme inactif
      const { error: updateError } = await supabase
        .from('subscribers')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId);
      
      if (updateError) {
        throw new Error(`Error updating subscriber: ${updateError.message}`);
      }
      
      logEvent("Subscription marked as inactive", { user_id: userId });
    } else {
      logEvent("No subscriber found for subscription cancellation", { customer_id: customerId });
    }
  } catch (error) {
    logEvent(`Error in handleSubscriptionCancelled: ${error.message}`, { error });
  }
}

// Fonction utilitaire pour mettre à jour un abonné
async function updateSubscriber(
  supabase: any,
  userId: string,
  customerId: string,
  subscriptionId: string,
  plan: string,
  period_end: string,
  isActive: boolean = true
) {
  try {
    // Définir les limites de plateforme en fonction du plan
    let platformLimits = {
      tiktok: 2,
      youtube: 2,
      instagram: 2,
      facebook: 2,
      pinterest: 2,
      dropbox: 2,
      google_drive: 2
    };
    
    if (plan === "basic") {
      platformLimits = {
        tiktok: 2,
        youtube: 2,
        instagram: 2,
        facebook: 2,
        pinterest: 2,
        dropbox: 2,
        google_drive: 2
      };
    } else if (plan === "agency") {
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
    
    // Si on a l'ID utilisateur, on met à jour par user_id
    if (userId) {
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan: plan,
          is_active: isActive,
          subscription_ends_at: period_end,
          platform_limits: platformLimits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select();
      
      if (error) {
        throw new Error(`Error updating subscriber by user_id: ${error.message}`);
      }
      
      logEvent("Updated subscriber by user_id", { user_id: userId, plan, is_active: isActive });
    } 
    // Sinon, on met à jour par customer_id
    else {
      const { data, error } = await supabase
        .from('subscribers')
        .update({
          stripe_subscription_id: subscriptionId,
          plan: plan,
          is_active: isActive,
          subscription_ends_at: period_end,
          platform_limits: platformLimits,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId)
        .select();
      
      if (error) {
        throw new Error(`Error updating subscriber by customer_id: ${error.message}`);
      }
      
      logEvent("Updated subscriber by stripe_customer_id", { customer_id: customerId, plan, is_active: isActive });
    }
  } catch (error) {
    logEvent(`Error in updateSubscriber: ${error.message}`, { error });
    throw error;
  }
}
