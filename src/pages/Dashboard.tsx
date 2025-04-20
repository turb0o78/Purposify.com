
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentAnalytics from "@/components/ContentAnalytics";
import ContentQueue from "@/components/ContentQueue";
import { Content, Connection, Workflow, DashboardStats } from "@/types";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for the initial dashboard view
const mockConnections: Connection[] = [
  {
    id: "tiktok-1",
    platform: "tiktok",
    name: "TikTok Demo",
    status: "connected",
    connected_at: new Date(),
  },
  {
    id: "youtube-1",
    platform: "youtube",
    name: "YouTube Demo",
    status: "connected",
    connected_at: new Date(),
  },
];

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
];

const mockWorkflows: Workflow[] = [
  {
    id: "workflow-1",
    name: "TikTok to YouTube",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceAccount: "tiktok-1",
    targetAccount: "youtube-1",
    isActive: true,
    rules: [
      {
        id: "rule-1",
        type: "hashtag",
        operator: "contains",
        value: "#viral",
      }
    ],
    createdAt: new Date(),
  }
];

const mockStats: DashboardStats = {
  today: {
    totalRepurposed: 5,
    pending: 2,
    published: 2,
    failed: 1,
  },
  week: {
    totalRepurposed: 28,
    pending: 8,
    published: 16,
    failed: 4,
  },
  month: {
    totalRepurposed: 67,
    pending: 12,
    published: 49,
    failed: 6,
  },
  total: {
    totalRepurposed: 124,
    pending: 15,
    published: 102,
    failed: 7,
  }
};

const Dashboard = () => {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [content, setContent] = useState<Content[]>(mockContent);
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, you'd fetch data from your API
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your content repurposing workflows and performance
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" asChild>
            <Link to="/content">View All Content</Link>
          </Button>
          <Button asChild>
            <Link to="/workflows/new">
              <Plus className="h-4 w-4 mr-1" />
              New Workflow
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Workflows</CardTitle>
            <CardDescription>Your automated content pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            {workflows.length > 0 ? (
              <div className="space-y-4">
                {workflows.map(workflow => (
                  <div 
                    key={workflow.id}
                    className="p-3 border rounded-md flex justify-between items-center hover:bg-slate-50 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Badge 
                          variant="outline" 
                          className={workflow.sourcePlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}
                        >
                          {workflow.sourcePlatform === "tiktok" ? "TikTok" : "YouTube"}
                        </Badge>
                        <ArrowRight className="mx-1 h-3 w-3" />
                        <Badge 
                          variant="outline" 
                          className={workflow.targetPlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}
                        >
                          {workflow.targetPlatform === "tiktok" ? "TikTok" : "YouTube"}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={workflow.isActive ? "default" : "secondary"}>
                      {workflow.isActive ? "Active" : "Paused"}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No workflows created yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/workflows">View All Workflows</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Recent Content</CardTitle>
            <CardDescription>Latest videos repurposed</CardDescription>
          </CardHeader>
          <CardContent>
            {content.length > 0 ? (
              <div className="space-y-4">
                {content.slice(0, 3).map(item => (
                  <div 
                    key={item.id}
                    className="flex gap-3 p-3 border rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="h-14 w-20 object-cover rounded"
                      />
                    ) : (
                      <div className="h-14 w-20 bg-gray-200 rounded flex items-center justify-center">
                        No img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Badge 
                          variant="outline" 
                          className={item.sourcePlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}
                        >
                          {item.sourcePlatform === "tiktok" ? "TikTok" : "YouTube"}
                        </Badge>
                        <ArrowRight className="mx-1 h-3 w-3" />
                        <Badge 
                          variant="outline" 
                          className={item.targetPlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}
                        >
                          {item.targetPlatform === "tiktok" ? "TikTok" : "YouTube"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      {item.status === "published" && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">Published</Badge>
                      )}
                      {item.status === "processing" && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">Processing</Badge>
                      )}
                      {item.status === "pending" && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      )}
                      {item.status === "failed" && (
                        <Badge variant="outline" className="bg-red-100 text-red-800">Failed</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No content processed yet</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/content">View All Content</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Platform Connections</CardTitle>
            <CardDescription>Manage your connected accounts</CardDescription>
          </CardHeader>
          <CardContent>
            {connections.length > 0 ? (
              <div className="space-y-4">
                {connections.map(connection => (
                  <div 
                    key={connection.id}
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${connection.platform === "tiktok" ? "platform-tiktok" : "platform-youtube"}`}>
                        {connection.platform === "tiktok" ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5">
                            <path
                              fill="currentColor"
                              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                            />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-5 w-5">
                            <path
                              fill="currentColor"
                              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{connection.name}</p>
                        <p className="text-sm text-muted-foreground">Connected</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No accounts connected</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/connections">Manage Connections</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="space-y-6">
        <ContentAnalytics stats={stats} isLoading={isLoading} />
        
        <ContentQueue items={content} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Dashboard;
