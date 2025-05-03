
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Connection, Platform, ConnectionStatus } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webViewLink: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

export function useGoogleDrive() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  
  // Get Google Drive connections
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['google-drive-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', 'google_drive');
        
      if (error) throw error;
      
      // Map database results to our Connection interface
      return data.map(conn => ({
        id: conn.id,
        platform: conn.platform as Platform,
        name: conn.platform_username || `Google Drive Account`,
        status: "connected" as ConnectionStatus,
        avatar: conn.platform_avatar_url,
        connected_at: conn.created_at ? new Date(conn.created_at) : undefined
      })) as Connection[];
    },
    enabled: !!user,
  });
  
  // Fetch Google Drive files
  const fetchFiles = async (connectionId: string, fileType: 'video' | 'image' = 'video') => {
    if (!user || !connectionId) {
      throw new Error("User and connection ID are required");
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('google-drive-files', {
        body: {
          userId: user.id,
          connectionId,
          fileType
        }
      });
      
      if (error) {
        console.error("Google Drive files error:", error);
        throw error;
      }
      
      return data.files as GoogleDriveFile[];
    } catch (error) {
      console.error("Error fetching Google Drive files:", error);
      throw error;
    }
  };
  
  // Query for files in a specific Google Drive account
  const useFilesQuery = (connectionId?: string) => {
    return useQuery({
      queryKey: ['google-drive-files', connectionId],
      queryFn: () => fetchFiles(connectionId as string),
      enabled: !!user && !!connectionId,
    });
  };
  
  // Upload a video to Google Drive
  const uploadToGoogleDrive = async ({ 
    connectionId, 
    videoUrl, 
    videoName, 
    sourceInfo 
  }: { 
    connectionId: string;
    videoUrl: string;
    videoName: string;
    sourceInfo?: { platform: string, id: string }
  }) => {
    if (!user || !connectionId) {
      throw new Error("User and connection ID are required");
    }
    
    setIsUploading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('google-drive-upload', {
        body: {
          userId: user.id,
          connectionId,
          videoUrl,
          videoName,
          sourceInfo
        }
      });
      
      if (error) {
        console.error("Google Drive upload error:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Google Drive upload error:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Mutation for uploading to Google Drive
  const uploadMutation = useMutation({
    mutationFn: uploadToGoogleDrive,
    onSuccess: () => {
      toast({
        title: "Upload Successful",
        description: "Your video has been uploaded to Google Drive",
      });
    },
    onError: (error: Error) => {
      console.error("Google Drive upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload to Google Drive",
        variant: "destructive",
      });
    }
  });
  
  return {
    connections,
    connectionsLoading,
    useFilesQuery,
    uploadToGoogleDrive: uploadMutation.mutate,
    isUploading: isUploading || uploadMutation.isPending,
    uploadError: uploadMutation.error,
  };
}

export default useGoogleDrive;
