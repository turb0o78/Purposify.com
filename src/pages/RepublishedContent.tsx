
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight, Play, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface RepublishedVideo {
  id: string;
  workflow_id: string;
  source_platform: "tiktok" | "youtube";
  target_platform: "tiktok" | "youtube";
  source_video_id: string;
  target_video_id: string;
  title: string;
  description: string;
  status: "pending" | "published" | "failed";
  created_at: string;
  workflow_name?: string;
}

export default function RepublishedContent() {
  const [videos, setVideos] = useState<RepublishedVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchRepublishedVideos = async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      
      const { data: republishedData, error: republishedError } = await supabase
        .from('republished_content')
        .select(`
          *,
          workflow:workflow_id(name)
        `)
        .order('created_at', { ascending: false });
        
      if (republishedError) throw republishedError;
      
      if (republishedData) {
        setVideos(republishedData.map(video => ({
          ...video,
          workflow_name: video.workflow?.name
        })));
      }
    } catch (error) {
      console.error('Error fetching republished content:', error);
      toast({
        title: "Error",
        description: "Failed to load republished content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const manuallyTriggerCheck = async () => {
    try {
      toast({
        title: "Checking for new videos...",
        description: "This may take a moment."
      });
      
      const response = await fetch(`https://tarjnmziaghkzosivsqk.supabase.co/functions/v1/check-new-videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to check for new videos');
      }
      
      toast({
        title: "Success",
        description: `Checked for new videos. ${result.message || ''}`
      });
      
      // Trigger the video processing
      await processVideoQueue();
      
      // Refresh the list
      fetchRepublishedVideos();
      
    } catch (error) {
      console.error('Error triggering video check:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check for new videos.",
        variant: "destructive"
      });
    }
  };
  
  const processVideoQueue = async () => {
    try {
      toast({
        title: "Processing video queue...",
        description: "This may take a moment."
      });
      
      const response = await fetch(`https://tarjnmziaghkzosivsqk.supabase.co/functions/v1/process-video-queue`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to process video queue');
      }
      
      toast({
        title: "Success",
        description: `Processed videos in queue. ${result.message || ''}`
      });
      
      // Refresh the list
      fetchRepublishedVideos();
      
    } catch (error) {
      console.error('Error processing video queue:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process video queue.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchRepublishedVideos();
    }
  }, [user]);
  
  const getPlatformIcon = (platform: "tiktok" | "youtube") => {
    if (platform === "tiktok") {
      return (
        <div className="p-2 rounded-lg bg-black">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
            <path
              fill="currentColor"
              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
            />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="p-2 rounded-lg bg-red-600">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
            <path
              fill="currentColor"
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Button variant="ghost" className="mb-4 pl-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Retour
          </Button>
          <h1 className="text-3xl font-bold mb-1">Contenu Republié</h1>
          <p className="text-muted-foreground">
            Visualisez les vidéos automatiquement republiées sur d'autres plateformes
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={manuallyTriggerCheck}>
            Vérifier nouvelles vidéos
          </Button>
          <Button onClick={processVideoQueue}>
            Traiter la file d'attente
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">Aucun contenu republié</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Aucune vidéo n'a encore été republiée. Vérifiez vos workflows ou cliquez sur "Vérifier nouvelles vidéos".
            </p>
            <Button onClick={manuallyTriggerCheck}>
              Vérifier nouvelles vidéos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {videos.map(video => (
            <Card key={video.id} className="overflow-hidden">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="flex items-center gap-4">
                  {getPlatformIcon(video.source_platform)}
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  {getPlatformIcon(video.target_platform)}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {video.description || "Aucune description"}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge variant={video.status === "published" ? "default" : "destructive"}>
                      {video.status === "published" ? "Publié" : "Échec"}
                    </Badge>
                    
                    <span className="text-muted-foreground">
                      Workflow: {video.workflow_name || "Workflow inconnu"}
                    </span>
                    
                    <span className="text-muted-foreground">
                      {new Date(video.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  {video.status === "published" && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`https://www.${video.source_platform}.com/watch?v=${video.source_video_id}`, '_blank')}
                        className="flex items-center"
                      >
                        <Play className="h-4 w-4 mr-1" /> 
                        Source
                      </Button>
                      
                      <Button 
                        size="sm" 
                        onClick={() => window.open(`https://www.${video.target_platform}.com/watch?v=${video.target_video_id}`, '_blank')}
                        className="flex items-center"
                      >
                        <Play className="h-4 w-4 mr-1" /> 
                        Cible
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
