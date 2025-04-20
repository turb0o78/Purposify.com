
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Content } from "@/types";

export const useUserContent = () => {
  return useQuery({
    queryKey: ['user-content'],
    queryFn: async (): Promise<Content[]> => {
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
        throw error;
      }

      return data.map((item): Content => ({
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
    },
  });
};
