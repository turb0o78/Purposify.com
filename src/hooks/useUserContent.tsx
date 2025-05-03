
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface UserContentResponse {
  items: Content[];
}

export const useUserContent = () => {
  return useQuery({
    queryKey: ['user-content'],
    queryFn: async (): Promise<UserContentResponse> => {
      try {
        const { data, error } = await supabase
          .from('video_queue')
          .select(`
            *,
            workflows!inner (
              name,
              source_platform,
              target_platform
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching user content:", error);
          toast({
            title: "Error loading content",
            description: "Could not load your content. Please try again later.",
            variant: "destructive",
          });
          throw error;
        }

        if (!data || data.length === 0) {
          return { items: [] };
        }

        const items = data.map((item): Content => ({
          id: item.id,
          sourcePlatform: item.workflows.source_platform,
          targetPlatform: item.workflows.target_platform,
          sourceId: item.platform_video_id,
          title: item.title || 'Untitled',
          description: item.description,
          thumbnail: item.thumbnail,
          duration: item.duration,
          createdAt: new Date(item.created_at),
          status: item.status as Content['status'],
          error: item.error_message,
        }));

        return { items };
      } catch (error) {
        console.error("Error in useUserContent hook:", error);
        return { items: [] };
      }
    },
    refetchOnWindowFocus: false,
  });
};
