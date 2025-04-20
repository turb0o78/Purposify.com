
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformVideo {
  id: string;
  platform: 'tiktok' | 'youtube';
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  createdAt: Date;
}

export const usePlatformVideos = () => {
  return useQuery({
    queryKey: ['platform-videos'],
    queryFn: async (): Promise<PlatformVideo[]> => {
      const { data, error } = await supabase.functions.invoke('fetch-platform-videos');
      
      if (error) {
        console.error("Error fetching platform videos:", error);
        throw error;
      }

      return data.videos;
    },
  });
};
