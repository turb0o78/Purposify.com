
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Cloud, Upload, Check } from "lucide-react";
import useGoogleDrive from "@/hooks/useGoogleDrive";

interface GoogleDriveUploaderProps {
  videoUrl?: string;
  videoName?: string;
  sourceInfo?: {
    platform: string;
    id: string;
  };
  onUploadComplete?: () => void;
}

const GoogleDriveUploader = ({ 
  videoUrl, 
  videoName = "Video from Purposify", 
  sourceInfo,
  onUploadComplete 
}: GoogleDriveUploaderProps) => {
  const { connections, connectionsLoading, uploadToGoogleDrive, isUploading } = useGoogleDrive();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [uploaded, setUploaded] = useState(false);
  
  // Set the first connection as default if none selected yet
  if (connections && connections.length > 0 && !selectedConnectionId) {
    setSelectedConnectionId(connections[0].id);
  }
  
  const handleSelectConnection = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
  };
  
  const handleUpload = async () => {
    if (!videoUrl || !selectedConnectionId) {
      toast({
        title: "Upload Failed",
        description: "Missing video URL or Google Drive account",
        variant: "destructive",
      });
      return;
    }
    
    uploadToGoogleDrive(
      {
        connectionId: selectedConnectionId,
        videoUrl,
        videoName,
        sourceInfo
      },
      {
        onSuccess: () => {
          setUploaded(true);
          if (onUploadComplete) {
            onUploadComplete();
          }
        }
      }
    );
  };
  
  if (connectionsLoading) {
    return <Skeleton className="h-10 w-full" />;
  }
  
  if (!connections || connections.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <p className="mb-2 text-sm text-gray-600">
            Connect your Google Drive to save videos
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/connections"}
            className="w-full"
          >
            <Cloud className="mr-2 h-4 w-4" />
            Connect Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {connections.length > 1 && (
        <Select 
          value={selectedConnectionId} 
          onValueChange={handleSelectConnection}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Google Drive account" />
          </SelectTrigger>
          <SelectContent>
            {connections.map((connection) => (
              <SelectItem key={connection.id} value={connection.id}>
                {connection.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <Button
        className="w-full"
        onClick={handleUpload}
        disabled={isUploading || !videoUrl || !selectedConnectionId || uploaded}
      >
        {uploaded ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Saved to Google Drive
          </>
        ) : isUploading ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-pulse" />
            Uploading...
          </>
        ) : (
          <>
            <Cloud className="mr-2 h-4 w-4" />
            Save to Google Drive
          </>
        )}
      </Button>
    </div>
  );
};

export default GoogleDriveUploader;
