
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface SubscriptionStatus {
  plan: 'trial' | 'basic' | 'agency';
  is_active: boolean;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  platform_limits?: Record<string, number>;
}

export const useSubscription = () => {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: async (): Promise<SubscriptionStatus> => {
      try {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        
        if (error) {
          console.error("Error checking subscription:", error);
          toast({
            title: "Error",
            description: "Could not verify subscription status",
            variant: "destructive",
          });
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Error in useSubscription hook:", error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every minute
  });
};
