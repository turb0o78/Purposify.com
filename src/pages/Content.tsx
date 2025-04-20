
import { useState } from "react";
import { useUserContent } from "@/hooks/useUserContent";
import { usePlatformVideos } from "@/hooks/usePlatformVideos";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentQueue from "@/components/ContentQueue";
import { Content } from "@/types";
import { Plus, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ContentPage = () => {
  const { data: content = [], isLoading } = useUserContent();
  const { data: platformVideos = [], isLoading: isLoadingVideos, refetch: refetchVideos } = usePlatformVideos();
  
  // Filter content based on status
  const pendingContent = content.filter(item => item.status === "pending");
  const processingContent = content.filter(item => item.status === "processing");
  const publishedContent = content.filter(item => item.status === "published");
  const failedContent = content.filter(item => item.status === "failed");
  
  // Filter videos by platform
  const tiktokVideos = platformVideos.filter(video => video.platform === 'tiktok');
  const youtubeVideos = platformVideos.filter(video => video.platform === 'youtube');
  
  const handleRefresh = () => {
    refetchVideos();
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Content</h1>
          <p className="text-muted-foreground">
            Manage and monitor all your repurposed content
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoadingVideos}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingVideos ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="overflow-x-auto flex-nowrap pb-1">
          <TabsTrigger value="all">All Content ({content.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingContent.length})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({processingContent.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({publishedContent.length})</TabsTrigger>
          <TabsTrigger value="failed">Failed ({failedContent.length})</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok Videos ({tiktokVideos.length})</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Videos ({youtubeVideos.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ContentQueue items={content} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="pending">
          <ContentQueue items={pendingContent} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="processing">
          <ContentQueue items={processingContent} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="published">
          <ContentQueue items={publishedContent} isLoading={isLoading} />
        </TabsContent>
        
        <TabsContent value="failed">
          <ContentQueue items={failedContent} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="tiktok">
          {isLoadingVideos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : tiktokVideos.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-muted/20">
              <h3 className="font-medium mb-2">No TikTok videos found</h3>
              <p className="text-muted-foreground mb-4">Make sure your TikTok account is connected and has videos available.</p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Videos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiktokVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">No thumbnail</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="youtube">
          {isLoadingVideos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : youtubeVideos.length === 0 ? (
            <div className="text-center p-6 border rounded-lg bg-muted/20">
              <h3 className="font-medium mb-2">No YouTube videos found</h3>
              <p className="text-muted-foreground mb-4">Make sure your YouTube account is connected and has videos available.</p>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Videos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubeVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {video.thumbnail ? (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <p className="text-muted-foreground">No thumbnail</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{video.title}</h3>
                    {video.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPage;
