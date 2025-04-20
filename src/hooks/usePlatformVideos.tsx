
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface PlatformVideo {
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
      try {
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No authenticated session found');
          return [];
        }
        
        console.log('Fetching platform videos...');
        const { data, error } = await supabase.functions.invoke('fetch-platform-videos');
        
        if (error) {
          console.error("Error fetching platform videos:", error);
          toast({
            title: "Error loading videos",
            description: "Could not load your platform videos. Please try again later.",
            variant: "destructive",
          });
          throw error;
        }

        // Check if videos exist in response
        if (!data?.videos || !Array.isArray(data.videos)) {
          console.warn("No videos found in API response", data);
          return [];
        }

        console.log(`Received ${data.videos.length} platform videos`);
        return data.videos;
      } catch (error) {
        console.error("Error in usePlatformVideos hook:", error);
        toast({
          title: "Error loading videos",
          description: "There was an error loading your videos. Please refresh and try again.",
          variant: "destructive",
        });
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
};
