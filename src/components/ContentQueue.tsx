
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Content } from "@/types";
import { Play, Pause, ArrowRight, XCircle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const statusIconMap = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  processing: <Play className="h-4 w-4 text-blue-500" />,
  published: <CheckCircle className="h-4 w-4 text-green-500" />,
  failed: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusTextMap = {
  pending: "Pending",
  processing: "Processing",
  published: "Published",
  failed: "Failed",
};

interface ContentQueueProps {
  items: Content[];
  isLoading?: boolean;
  refetch?: () => void;
}

const ContentQueue = ({ items, isLoading = false, refetch }: ContentQueueProps) => {
  const [currentFilter, setCurrentFilter] = useState<Content["status"] | "all">("all");
  const [processingItems, setProcessingItems] = useState<string[]>([]);
  
  const filteredItems = currentFilter === "all" 
    ? items 
    : items.filter(item => item.status === currentFilter);

  const handlePublishNow = async (item: Content) => {
    try {
      setProcessingItems(prev => [...prev, item.id]);
      
      // Call the edge function to process this specific video
      const response = await supabase.functions.invoke('process-video', {
        body: { videoId: item.id }
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to publish content");
      }

      toast({
        title: "Processing started",
        description: "Your content is now being processed for publishing",
      });
      
      // Refetch content after successful publish action
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error("Error publishing content:", error);
      toast({
        title: "Publication failed",
        description: error.message || "There was an error publishing your content",
        variant: "destructive",
      });
    } finally {
      setProcessingItems(prev => prev.filter(id => id !== item.id));
    }
  };

  const handlePause = async (item: Content) => {
    try {
      // Call the API to pause processing
      const { error } = await supabase
        .from('video_queue')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', item.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Processing paused",
        description: "Your content has been returned to pending status",
      });
      
      // Refetch content after successful pause action
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error("Error pausing content:", error);
      toast({
        title: "Failed to pause",
        description: "There was an error pausing your content",
        variant: "destructive",
      });
    }
  };

  const renderStatus = (status: Content["status"]) => {
    const icon = statusIconMap[status];
    const text = statusTextMap[status];
    
    let bgColor = "bg-gray-100 text-gray-800";
    switch (status) {
      case "pending":
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
      case "processing":
        bgColor = "bg-blue-100 text-blue-800";
        break;
      case "published":
        bgColor = "bg-green-100 text-green-800";
        break;
      case "failed":
        bgColor = "bg-red-100 text-red-800";
        break;
    }
    
    return (
      <div className="flex items-center">
        <Badge variant="outline" className={`flex items-center gap-1 ${bgColor}`}>
          {icon}
          <span>{text}</span>
        </Badge>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Content Queue</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={currentFilter === "all" ? "default" : "outline"}
              onClick={() => setCurrentFilter("all")}
            >
              All
            </Button>
            <Button 
              size="sm" 
              variant={currentFilter === "pending" ? "default" : "outline"}
              onClick={() => setCurrentFilter("pending")}
              className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900"
            >
              Pending
            </Button>
            <Button 
              size="sm" 
              variant={currentFilter === "processing" ? "default" : "outline"}
              onClick={() => setCurrentFilter("processing")}
              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 hover:text-blue-900"
            >
              Processing
            </Button>
            <Button 
              size="sm" 
              variant={currentFilter === "published" ? "default" : "outline"}
              onClick={() => setCurrentFilter("published")}
              className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900"
            >
              Published
            </Button>
            <Button 
              size="sm" 
              variant={currentFilter === "failed" ? "default" : "outline"}
              onClick={() => setCurrentFilter("failed")}
              className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900"
            >
              Failed
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-pulse-subtle">Loading content queue...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            No content found in the queue
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="h-10 w-16 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          No img
                        </div>
                      )}
                      <div className="truncate max-w-[200px]">{item.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.sourcePlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}>
                      {item.sourcePlatform === "tiktok" ? "TikTok" : "YouTube"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <Badge variant="outline" className={item.targetPlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}>
                        {item.targetPlatform === "tiktok" ? "TikTok" : "YouTube"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{renderStatus(item.status)}</TableCell>
                  <TableCell>
                    {item.scheduledFor ? 
                      new Date(item.scheduledFor).toLocaleDateString() : 
                      <span className="text-gray-400">Not scheduled</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {item.status === "pending" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePublishNow(item)}
                          disabled={processingItems.includes(item.id)}
                        >
                          {processingItems.includes(item.id) ? (
                            <span className="flex items-center">
                              <span className="h-4 w-4 mr-1 animate-spin border-2 border-b-transparent rounded-full" /> Processing...
                            </span>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-1" /> Publish Now
                            </>
                          )}
                        </Button>
                      )}
                      {item.status === "processing" && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePause(item)}
                        >
                          <Pause className="h-4 w-4 mr-1" /> Pause
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentQueue;
