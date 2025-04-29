
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface SubscriptionStatus {
  plan: 'trial' | 'basic' | 'agency';
  is_active: boolean;
  trial_ends_at?: string;
  subscription_ends_at?: string;
  platform_limits?: Record<string, number>;
}

export const useSubscription = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      try {
        console.log("Checking subscription status for user:", user?.id);
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

        console.log("Subscription check result:", data);
        return data;
      } catch (error) {
        console.error("Error in useSubscription hook:", error);
        throw error;
      }
    },
    enabled: !!user,
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
};
