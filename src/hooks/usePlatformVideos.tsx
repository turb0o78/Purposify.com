
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
        console.log('Démarrage de la récupération des vidéos de plateforme...');
        
        // Vérifier d'abord si l'utilisateur est authentifié
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('Aucune session authentifiée trouvée');
          return [];
        }
        
        console.log('Session authentifiée trouvée, appel de la fonction edge...');
        
        // Appeler directement la fonction edge avec le bon token
        const { data, error } = await supabase.functions.invoke('fetch-platform-videos', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (error) {
          console.error("Erreur lors de la récupération des vidéos de plateforme:", error);
          
          // Fournir des messages d'erreur plus informatifs
          const errorMessage = typeof error === 'object' && error !== null && 'message' in error
            ? error.message
            : 'Impossible de charger vos vidéos de plateforme. Veuillez réessayer plus tard.';
            
          toast({
            title: "Erreur lors du chargement des vidéos",
            description: errorMessage,
            variant: "destructive",
          });
          
          return [];
        }

        // Vérifier si les vidéos existent dans la réponse
        if (!data?.videos || !Array.isArray(data.videos)) {
          console.warn("Aucune vidéo trouvée dans la réponse de l'API", data);
          
          toast({
            title: "Aucune vidéo trouvée",
            description: "Nous n'avons trouvé aucune vidéo pour vos comptes connectés.",
          });
          
          return [];
        }

        console.log(`Reçu ${data.videos.length} vidéos de plateforme`);
        
        // Analyser correctement les dates pour s'assurer qu'elles sont des objets Date
        const parsedVideos = data.videos.map(video => ({
          ...video,
          createdAt: new Date(video.createdAt)
        }));
        
        return parsedVideos;
      } catch (error) {
        console.error("Erreur dans le hook usePlatformVideos:", error);
        
        toast({
          title: "Erreur lors du chargement des vidéos",
          description: "Il y a eu une erreur lors du chargement de vos vidéos. Veuillez actualiser et réessayer.",
          variant: "destructive",
        });
        
        // Retourner un tableau vide en cas d'erreur
        return [];
      }
    },
    retry: 3, // Augmenter le nombre de tentatives
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Rafraîchir toutes les 5 minutes
  });
};
