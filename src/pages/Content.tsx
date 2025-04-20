
import { useState } from "react";
import { useUserContent } from "@/hooks/useUserContent";
import { usePlatformVideos } from "@/hooks/usePlatformVideos";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentQueue from "@/components/ContentQueue";
import { Content } from "@/types";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";

const ContentPage = () => {
  const { data: content = [], isLoading } = useUserContent();
  const { data: platformVideos = [], isLoading: isLoadingVideos } = usePlatformVideos();
  
  // Filter content based on status
  const pendingContent = content.filter(item => item.status === "pending");
  const processingContent = content.filter(item => item.status === "processing");
  const publishedContent = content.filter(item => item.status === "published");
  const failedContent = content.filter(item => item.status === "failed");
  
  // Filter videos by platform
  const tiktokVideos = platformVideos.filter(video => video.platform === 'tiktok');
  const youtubeVideos = platformVideos.filter(video => video.platform === 'youtube');
  
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
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
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
            <div className="text-center p-6">Loading TikTok videos...</div>
          ) : tiktokVideos.length === 0 ? (
            <div className="text-center p-6">No TikTok videos found. Make sure your TikTok account is connected.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tiktokVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {video.thumbnail && (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
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
            <div className="text-center p-6">Loading YouTube videos...</div>
          ) : youtubeVideos.length === 0 ? (
            <div className="text-center p-6">No YouTube videos found. Make sure your YouTube account is connected.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {youtubeVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    {video.thumbnail && (
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
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
