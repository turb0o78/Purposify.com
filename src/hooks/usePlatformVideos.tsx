
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
          
          if (data && Object.keys(data).length > 0) {
            return [];
          }
          
          toast({
            title: "No videos found",
            description: "We couldn't find any videos for your connected accounts.",
          });
          return [];
        }

        console.log(`Received ${data.videos.length} platform videos`);
        
        // If we have videos, return them
        if (data.videos.length > 0) {
          return data.videos;
        }
        
        // If we have no videos but there was no error, show a more informative message
        toast({
          title: "No videos found",
          description: "You don't have any videos on your connected platforms or we couldn't access them.",
        });
        return [];
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
    retry: 2, // Increase retries from 1 to 2
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
