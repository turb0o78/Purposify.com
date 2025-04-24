
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

const plans = [
  {
    name: 'Basic',
    price: 7.99,
    features: [
      'Vidéos publiées illimitées',
      '2 comptes par plateforme',
      'Toutes les plateformes supportées',
    ],
  },
  {
    name: 'Agency',
    price: 18.99,
    features: [
      'Vidéos publiées illimitées',
      '10 comptes par plateforme',
      'Toutes les plateformes supportées',
      'Support prioritaire',
    ],
  },
];

export default function SubscriptionPage() {
  const { data: subscription, isLoading } = useSubscription();

  const handleSubscribe = async (plan: 'basic' | 'agency') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le processus d'abonnement. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Abonnement</h1>
        {subscription?.plan === 'trial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h3 className="text-lg font-semibold text-blue-700">Période d'essai en cours</h3>
            <p className="text-blue-600">
              Votre période d'essai se termine le{' '}
              {subscription.trial_ends_at && (
                <span className="font-medium">
                  {format(new Date(subscription.trial_ends_at), "d MMMM yyyy", { locale: fr })}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${
            subscription?.plan?.toLowerCase() === plan.name.toLowerCase()
              ? 'border-2 border-primary'
              : ''
          }`}>
            {subscription?.plan?.toLowerCase() === plan.name.toLowerCase() && (
              <div className="absolute top-4 right-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">{formatPrice(plan.price)}</span>
                /mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                onClick={() => handleSubscribe(plan.name.toLowerCase() as 'basic' | 'agency')}
                disabled={subscription?.plan?.toLowerCase() === plan.name.toLowerCase()}
              >
                {subscription?.plan?.toLowerCase() === plan.name.toLowerCase()
                  ? 'Abonnement actif'
                  : "S'abonner"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
