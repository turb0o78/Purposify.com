
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentQueue from "@/components/ContentQueue";
import { Content } from "@/types";
import { Plus } from "lucide-react";

// Mock data for the content items
const mockContent: Content[] = [
  {
    id: "content-1",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceId: "source-1",
    title: "How to Make Perfect Pancakes Every Time",
    thumbnail: "https://picsum.photos/seed/pancakes/300/200",
    duration: 45,
    createdAt: new Date(),
    status: "published",
    publishedAt: new Date(),
  },
  {
    id: "content-2",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceId: "source-2",
    title: "5 Life Hacks You Didn't Know You Needed",
    thumbnail: "https://picsum.photos/seed/lifehacks/300/200",
    duration: 58,
    createdAt: new Date(),
    status: "processing",
  },
  {
    id: "content-3",
    sourcePlatform: "youtube",
    targetPlatform: "tiktok",
    sourceId: "source-3",
    title: "Learn This Dance in 60 Seconds",
    thumbnail: "https://picsum.photos/seed/dance/300/200",
    duration: 62,
    createdAt: new Date(),
    status: "pending",
    scheduledFor: new Date(Date.now() + 86400000), // Tomorrow
  },
  {
    id: "content-4",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceId: "source-4",
    title: "Why This Recipe Went Viral",
    thumbnail: "https://picsum.photos/seed/viral/300/200",
    duration: 32,
    createdAt: new Date(),
    status: "failed",
    error: "Video format not supported",
  },
  {
    id: "content-5",
    sourcePlatform: "youtube",
    targetPlatform: "tiktok",
    sourceId: "source-5",
    title: "DIY Home Decor Ideas Anyone Can Do",
    thumbnail: "https://picsum.photos/seed/decor/300/200",
    duration: 75,
    createdAt: new Date(),
    status: "pending",
    scheduledFor: new Date(Date.now() + 172800000), // Day after tomorrow
  },
  {
    id: "content-6",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceId: "source-6",
    title: "Quick Workout For Busy People",
    thumbnail: "https://picsum.photos/seed/workout/300/200",
    duration: 42,
    createdAt: new Date(),
    status: "published",
    publishedAt: new Date(Date.now() - 259200000), // 3 days ago
  },
  {
    id: "content-7",
    sourcePlatform: "youtube",
    targetPlatform: "tiktok",
    sourceId: "source-7",
    title: "Top 3 Summer Fashion Trends",
    thumbnail: "https://picsum.photos/seed/fashion/300/200",
    duration: 53,
    createdAt: new Date(),
    status: "published",
    publishedAt: new Date(Date.now() - 432000000), // 5 days ago
  },
];

const ContentPage = () => {
  const [content, setContent] = useState<Content[]>(mockContent);
  
  // Filter content based on status
  const pendingContent = content.filter(item => item.status === "pending");
  const processingContent = content.filter(item => item.status === "processing");
  const publishedContent = content.filter(item => item.status === "published");
  const failedContent = content.filter(item => item.status === "failed");
  
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
        </TabsList>
        
        <TabsContent value="all">
          <ContentQueue items={content} />
        </TabsContent>
        
        <TabsContent value="pending">
          <ContentQueue items={pendingContent} />
        </TabsContent>
        
        <TabsContent value="processing">
          <ContentQueue items={processingContent} />
        </TabsContent>
        
        <TabsContent value="published">
          <ContentQueue items={publishedContent} />
        </TabsContent>
        
        <TabsContent value="failed">
          <ContentQueue items={failedContent} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentPage;
