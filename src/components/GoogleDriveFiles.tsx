
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VideoIcon, Clock, FilePlus, Upload } from "lucide-react";
import useGoogleDrive from "@/hooks/useGoogleDrive";

interface GoogleDriveFilesProps {
  onSelectFile?: (file: any) => void;
}

const GoogleDriveFiles = ({ onSelectFile }: GoogleDriveFilesProps) => {
  const { connections, connectionsLoading, useFilesQuery } = useGoogleDrive();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  
  const { 
    data: files, 
    isLoading: filesLoading, 
    error: filesError,
    refetch: refetchFiles
  } = useFilesQuery(selectedConnectionId);
  
  // Set the first connection as default if none selected yet
  if (connections && connections.length > 0 && !selectedConnectionId) {
    setSelectedConnectionId(connections[0].id);
  }
  
  const handleSelectConnection = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
  };
  
  const handleSelectFile = (file: any) => {
    if (onSelectFile) {
      onSelectFile(file);
    }
  };
  
  if (connectionsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!connections || connections.length === 0) {
    return (
      <Card className="w-full h-full min-h-[300px] flex flex-col items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="bg-gray-100 rounded-full p-4">
            <FilePlus className="h-10 w-10 text-gray-500" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-1">No Google Drive Connected</h3>
            <p className="text-gray-500 mb-4">
              Connect your Google Drive account to browse and use your videos
            </p>
            <Button 
              className="mt-2" 
              variant="outline"
              onClick={() => window.location.href = "/connections"}
            >
              Connect Google Drive
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">Google Drive Videos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        {filesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        
        {filesError && (
          <div className="text-center py-8 text-red-500">
            <p>Error loading files: {filesError.message}</p>
            <Button 
              onClick={() => refetchFiles()} 
              variant="outline" 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        
        {!filesLoading && !filesError && files && files.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <Card 
                key={file.id} 
                className="overflow-hidden hover:border-brand-purple/50 cursor-pointer"
                onClick={() => handleSelectFile(file)}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                  {file.thumbnailLink ? (
                    <img 
                      src={file.thumbnailLink} 
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <VideoIcon className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(file.createdTime).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !filesLoading && !filesError ? (
          <div className="text-center py-8">
            <VideoIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
            <h3 className="text-lg font-medium">No videos found</h3>
            <p className="text-gray-500">Upload videos to your Google Drive to see them here</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default GoogleDriveFiles;
