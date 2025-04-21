
import { useState } from "react";
import { useUserContent } from "@/hooks/useUserContent";
import { usePlatformVideos } from "@/hooks/usePlatformVideos";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentQueue from "@/components/ContentQueue";
import { Content } from "@/types";
import { Plus, RefreshCw, Eye, Heart, MessageSquare, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const ContentPage = () => {
  const { data: content = [], isLoading, refetch: refetchContent } = useUserContent();
  const { data: platformVideos = [], isLoading: isLoadingVideos, refetch: refetchVideos } = usePlatformVideos();
  
  // Filter content based on status
  const pendingContent = content.filter(item => item.status === "pending");
  const processingContent = content.filter(item => item.status === "processing");
  const publishedContent = content.filter(item => item.status === "published");
  const failedContent = content.filter(item => item.status === "failed");
  
  // Filter videos by platform
  const tiktokVideos = platformVideos.filter(video => video.platform === 'tiktok');
  const youtubeVideos = platformVideos.filter(video => video.platform === 'youtube');
  
  const handleRefresh = async () => {
    toast({
      title: "Refreshing content",
      description: "Fetching the latest content from your platforms..."
    });
    
    await Promise.all([refetchContent(), refetchVideos()]);
    
    toast({
      title: "Refresh complete",
      description: "Your content has been updated"
    });
  };

  const formatNumber = (num?: number): string => {
    if (num === undefined) return "-";
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    return `${(num / 1000000).toFixed(1)}M`;
  };

  const VideoCard = ({ video }: { video: typeof platformVideos[0] }) => (
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
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-black/70 text-white">
            {video.platform === 'tiktok' ? 'TikTok' : 'YouTube'}
          </Badge>
        </div>
        {video.duration && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="bg-black/70 text-white">
              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
            </Badge>
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
        
        {/* Stats section */}
        <div className="mt-3 flex justify-between text-xs text-muted-foreground">
          {video.viewCount !== undefined && (
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              <span>{formatNumber(video.viewCount)}</span>
            </div>
          )}
          {video.likeCount !== undefined && (
            <div className="flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              <span>{formatNumber(video.likeCount)}</span>
            </div>
          )}
          {video.commentCount !== undefined && (
            <div className="flex items-center">
              <MessageSquare className="h-3 w-3 mr-1" />
              <span>{formatNumber(video.commentCount)}</span>
            </div>
          )}
          {video.shareCount !== undefined && (
            <div className="flex items-center">
              <Share2 className="h-3 w-3 mr-1" />
              <span>{formatNumber(video.shareCount)}</span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex space-x-2">
          {video.shareUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.open(video.shareUrl, '_blank')}
            >
              View
            </Button>
          )}
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
          >
            Repurpose
          </Button>
        </div>
      </div>
    </Card>
  );
  
  const VideoGrid = ({ videos, isLoading, platform }: { videos: typeof platformVideos, isLoading: boolean, platform: 'tiktok' | 'youtube' }) => {
    if (isLoading) {
      return (
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
      );
    }
    
    if (videos.length === 0) {
      return (
        <div className="text-center p-6 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-2">No {platform === 'tiktok' ? 'TikTok' : 'YouTube'} videos found</h3>
          <p className="text-muted-foreground mb-4">
            Make sure your {platform === 'tiktok' ? 'TikTok' : 'YouTube'} account is connected and has videos available.
          </p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Videos
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    );
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
          <ContentQueue items={content} isLoading={isLoading} refetch={refetchContent} />
        </TabsContent>
        
        <TabsContent value="pending">
          <ContentQueue items={pendingContent} isLoading={isLoading} refetch={refetchContent} />
        </TabsContent>
        
        <TabsContent value="processing">
          <ContentQueue items={processingContent} isLoading={isLoading} refetch={refetchContent} />
        </TabsContent>
        
        <TabsContent value="published">
          <ContentQueue items={publishedContent} isLoading={isLoading} refetch={refetchContent} />
        </TabsContent>
        
        <TabsContent value="failed">
          <ContentQueue items={failedContent} isLoading={isLoading} refetch={refetchContent} />
        </TabsContent>

        <TabsContent value="tiktok">
          <VideoGrid 
            videos={tiktokVideos}
            isLoading={isLoadingVideos}
            platform="tiktok"
          />
        </TabsContent>

        <TabsContent value="youtube">
          <VideoGrid 
            videos={youtubeVideos}
            isLoading={isLoadingVideos}
            platform="youtube"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPage;
