
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
        
        // Vérifier d'abord si l'utilisateur est authentifié
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No authenticated session found');
          return [];
        }
        
        console.log('Authenticated session found, invoking edge function...');
        
        // Ajouter un délai d'attente à la demande
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out')), 30000); // 30 secondes de délai
        });
        
        // Créer la promesse de requête réelle
        const fetchPromise = supabase.functions.invoke('fetch-platform-videos', {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        // Faire la course entre la récupération et le délai d'attente
        const { data, error } = await Promise.race([fetchPromise, timeoutPromise])
          .then(result => result as typeof fetchPromise extends Promise<infer T> ? T : never)
          .catch(err => {
            console.error("Error or timeout in fetch-platform-videos:", err);
            return { data: null, error: err };
          });
        
        if (error) {
          console.error("Error fetching platform videos:", error);
          
          // Fournir des messages d'erreur plus informatifs
          const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? error.message
            : 'Could not load your platform videos. Please try again later.';
            
          toast({
            title: "Error loading videos",
            description: errorMessage,
            variant: "destructive",
          });
          
          return [];
        }

        // Vérifier si les vidéos existent dans la réponse
        if (!data?.videos || !Array.isArray(data.videos)) {
          console.warn("No videos found in API response", data);
          
          toast({
            title: "No videos found",
            description: "We couldn't find any videos for your connected accounts.",
          });
          
          return [];
        }

        console.log(`Received ${data.videos.length} platform videos`);
        
        // Analyser correctement les dates pour s'assurer qu'elles sont des objets Date
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
        
        // Retourner un tableau vide en cas d'erreur
        return [];
      }
    },
    retry: 2, // Réessayer deux fois pour gérer les erreurs transitoires
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Rafraîchir toutes les 10 minutes
  });
};
