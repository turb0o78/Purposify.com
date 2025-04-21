
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
  shareUrl?: string;
  videoUrl?: string;
  embedHtml?: string;
  embedLink?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
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
          throw error; // Throw error to trigger retry mechanism
        }

        // Check if videos exist in response
        if (!data?.videos || !Array.isArray(data.videos)) {
          console.warn("No videos found in API response", data);
          
          toast({
            title: "No videos found",
            description: "We couldn't find any videos for your connected accounts.",
          });
          return [];
        }

        console.log(`Received ${data.videos.length} platform videos`);
        
        // Parse the dates properly to ensure they're Date objects
        const parsedVideos = data.videos.map(video => ({
          ...video,
          createdAt: new Date(video.createdAt)
        }));
        
        return parsedVideos;
      } catch (error) {
        console.error("Error in usePlatformVideos hook:", error);
        toast({
          title: "Error loading videos",
          description: "There was an error loading your videos. Please refresh and try again.",
          variant: "destructive",
        });
        throw error; // Re-throw to let React Query handle retries
      }
    },
    retry: 1, // Only retry once to avoid too many error messages
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
