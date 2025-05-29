
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
          
          // Ne pas afficher de toast d'erreur si c'est juste qu'il n'y a pas de vidéos
          if (data?.videos && Array.isArray(data.videos) && data.videos.length === 0) {
            console.log("Tableau de vidéos vide - normal si aucune connexion ou vidéos");
          } else {
            toast({
              title: "Aucune vidéo trouvée",
              description: "Nous n'avons trouvé aucune vidéo pour vos comptes connectés.",
            });
          }
          
          return [];
        }

        console.log(`Reçu ${data.videos.length} vidéos de plateforme`);
        
        // Analyser correctement les dates pour s'assurer qu'elles sont des objets Date
        const parsedVideos = data.videos.map(video => ({
          ...video,
          createdAt: new Date(video.createdAt)
        }));
        
        // Afficher un message de succès si on a des vraies vidéos (pas des demos)
        const realVideos = parsedVideos.filter(v => 
          !v.id.includes('demo') && 
          !v.id.includes('mock') && 
          !v.id.includes('error') && 
          !v.id.includes('connected')
        );
        
        if (realVideos.length > 0) {
          console.log(`${realVideos.length} vraies vidéos trouvées`);
          toast({
            title: "Vidéos chargées avec succès",
            description: `${realVideos.length} vidéo(s) trouvée(s) sur vos plateformes connectées`,
          });
        }
        
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
    retry: 2, // Réduire le nombre de tentatives pour éviter les spams
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - augmenter le stale time
    refetchInterval: false, // Désactiver le rafraîchissement automatique pour éviter les appels excessifs
  });
};
