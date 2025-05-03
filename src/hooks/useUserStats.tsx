
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardStats } from "@/types";

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase
        .from('content_statistics')
        .select('*')
        .single();

      if (error) {
        console.error("Error fetching user stats:", error);
        throw error;
      }

      // Return transformed data with all required fields
      return {
        totalRepurposed: data?.total_repurposed || 0,
        pending: data?.total_pending || 0,
        published: data?.total_published || 0,
        failed: data?.total_failed || 0,
        averageViews: data?.average_views || 0,
        averageLikes: data?.average_likes || 0,
        // These fields need to be added - they don't exist directly in the DB response
        videos_processed: data?.total_repurposed || 0,
        videos_published: data?.total_published || 0,
        accounts_connected: data?.accounts_connected || 0, // Provide default values
        platforms_connected: data?.platforms_connected || 0, // Provide default values
      };
    },
  });
};
