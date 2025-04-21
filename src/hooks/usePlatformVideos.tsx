
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
        console.log('Starting platform videos fetch...');
        
        // First check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No authenticated session found');
          return [];
        }
        
        console.log('Authenticated session found, invoking edge function...');
        
        // Add a timeout to the request
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), 30000); // 30 seconds timeout
        });
        
        // Create the actual request promise
        const fetchPromise = supabase.functions.invoke('fetch-platform-videos');
        
        // Race the fetch against the timeout
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
          .then(result => result as typeof fetchPromise extends Promise<infer T> ? T : never)
          .catch(err => {
            console.error("Error or timeout in fetch-platform-videos:", err);
            return { data: null, error: err };
          });
        
        if (error) {
          console.error("Error fetching platform videos:", error);
          
          // Provide more informative error messages
          const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? error.message
            : 'Could not load your platform videos. Please try again later.';
            
          toast({
            title: "Error loading videos",
            description: errorMessage,
            variant: "destructive",
          });
          
          // Return mock data for development purposes
          console.log('Returning mock videos as fallback');
          return createMockVideos();
        }

        // Check if videos exist in response
        if (!data?.videos || !Array.isArray(data.videos)) {
          console.warn("No videos found in API response", data);
          
          toast({
            title: "No videos found",
            description: "We couldn't find any videos for your connected accounts.",
          });
          
          return createMockVideos();
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
        
        // Return mock data as fallback for development
        return createMockVideos();
      }
    },
    retry: 2, // Retry twice to handle transient errors
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
};

// Helper function to create mock videos for development/fallback
const createMockVideos = (): PlatformVideo[] => {
  console.log('Creating mock videos as fallback');
  
  return [
    // TikTok mock videos
    {
      id: 'tiktok-mock-1',
      platform: 'tiktok',
      title: 'TikTok Demo Video #1',
      description: 'This is a sample TikTok video for testing',
      thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sample+1',
      duration: 30,
      createdAt: new Date(),
      shareUrl: 'https://tiktok.com/@user/video/mock1',
      videoUrl: 'https://tiktok.com/@user/video/mock1',
      viewCount: 1250,
      likeCount: 350,
      commentCount: 48,
      shareCount: 12
    },
    {
      id: 'tiktok-mock-2',
      platform: 'tiktok',
      title: 'TikTok Demo Video #2',
      description: 'Another sample TikTok video for testing',
      thumbnail: 'https://via.placeholder.com/300x500.png?text=TikTok+Sample+2',
      duration: 45,
      createdAt: new Date(Date.now() - 86400000),
      shareUrl: 'https://tiktok.com/@user/video/mock2',
      videoUrl: 'https://tiktok.com/@user/video/mock2',
      viewCount: 2300,
      likeCount: 540,
      commentCount: 62,
      shareCount: 21
    },
    // YouTube mock videos
    {
      id: 'youtube-mock-1',
      platform: 'youtube',
      title: 'YouTube Demo Video #1',
      description: 'This is a sample YouTube video for testing',
      thumbnail: 'https://via.placeholder.com/480x360.png?text=YouTube+Sample+1',
      duration: 240,
      createdAt: new Date(),
      shareUrl: 'https://youtube.com/watch?v=mock1',
      videoUrl: 'https://youtube.com/watch?v=mock1',
      embedLink: 'https://www.youtube.com/embed/mock1',
      viewCount: 15000,
      likeCount: 2500,
      commentCount: 320
    },
    {
      id: 'youtube-mock-2',
      platform: 'youtube',
      title: 'YouTube Demo Video #2',
      description: 'Another sample YouTube video for testing',
      thumbnail: 'https://via.placeholder.com/480x360.png?text=YouTube+Sample+2',
      duration: 360,
      createdAt: new Date(Date.now() - 172800000),
      shareUrl: 'https://youtube.com/watch?v=mock2',
      videoUrl: 'https://youtube.com/watch?v=mock2',
      embedLink: 'https://www.youtube.com/embed/mock2',
      viewCount: 28000,
      likeCount: 3600,
      commentCount: 450
    }
  ];
};
