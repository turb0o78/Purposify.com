
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentStats } from "@/types";

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async (): Promise<ContentStats> => {
      const { data, error } = await supabase
        .from('content_statistics')
        .select('*')
        .single();

      if (error) {
        console.error("Error fetching user stats:", error);
        throw error;
      }

      return {
        totalRepurposed: data?.total_repurposed || 0,
        pending: data?.total_pending || 0,
        published: data?.total_published || 0,
        failed: data?.total_failed || 0,
        averageViews: data?.average_views || 0,
        averageLikes: data?.average_likes || 0,
      };
    },
  });
};
