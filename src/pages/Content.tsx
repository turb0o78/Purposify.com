import { useState } from "react";
import { useUserContent } from "@/hooks/useUserContent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentQueue from "@/components/ContentQueue";
import { Content } from "@/types";
import { Plus } from "lucide-react";

const ContentPage = () => {
  const { data: content = [], isLoading } = useUserContent();
  
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
      </Tabs>
    </div>
  );
};

export default ContentPage;
