
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Add Badge import
import { ContentStats, Platform } from "@/types";
import { ArrowRight } from "lucide-react";

// Sample data for the dashboard
const dashboardData = {
  today: {
    totalRepurposed: 5,
    pending: 2,
    published: 3,
    failed: 0,
    averageViews: 1240,
    averageLikes: 85,
  },
  week: {
    totalRepurposed: 24,
    pending: 5,
    published: 18,
    failed: 1,
    averageViews: 1850,
    averageLikes: 120,
  },
  month: {
    totalRepurposed: 87,
    pending: 12,
    published: 72,
    failed: 3,
    averageViews: 2200,
    averageLikes: 175,
  },
  total: {
    totalRepurposed: 412,
    pending: 12,
    published: 396,
    failed: 4,
    averageViews: 3100,
    averageLikes: 210,
  },
};

const recentContent = [
  {
    id: "content-1",
    title: "How I Built a Successful TikTok Channel in 3 Months",
    sourcePlatform: "tiktok" as Platform,
    targetPlatform: "youtube" as Platform,
    status: "published",
    createdAt: new Date(Date.now() - 7200000), // 2 hours ago
    views: 2430,
    likes: 187,
  },
  {
    id: "content-2",
    title: "5 JavaScript Tricks You Should Know",
    sourcePlatform: "youtube" as Platform,
    targetPlatform: "tiktok" as Platform,
    status: "pending",
    createdAt: new Date(Date.now() - 14400000), // 4 hours ago
  },
  {
    id: "content-3",
    title: "Day in the Life of a Developer",
    sourcePlatform: "tiktok" as Platform,
    targetPlatform: "youtube" as Platform,
    status: "processing",
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: "content-4",
    title: "Creating a Content Repurposing System",
    sourcePlatform: "youtube" as Platform,
    targetPlatform: "tiktok" as Platform,
    status: "failed",
    error: "Video dimensions not supported",
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
  },
];

const StatCard = ({ title, value, description, className = "" }: { title: string; value: number | string; description?: string; className?: string }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1">
            <span className="text-3xl font-bold">{value}</span>
            {description && (
              <span className="text-sm text-muted-foreground ml-1">{description}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

type TimeRange = "today" | "week" | "month" | "total";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const stats = dashboardData[timeRange];
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview and analytics for your content repurposing
          </p>
        </div>
        <div className="flex space-x-1 bg-muted rounded-lg p-1 mt-4 md:mt-0">
          <Button 
            variant={timeRange === "today" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("today")}
          >
            Today
          </Button>
          <Button 
            variant={timeRange === "week" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("week")}
          >
            Week
          </Button>
          <Button 
            variant={timeRange === "month" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("month")}
          >
            Month
          </Button>
          <Button 
            variant={timeRange === "total" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setTimeRange("total")}
          >
            Total
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Total Content Repurposed"
          value={stats.totalRepurposed}
          description={timeRange === "today" ? "today" : timeRange === "week" ? "this week" : timeRange === "month" ? "this month" : "all time"}
        />
        <StatCard 
          title="Pending"
          value={stats.pending}
        />
        <StatCard 
          title="Published"
          value={stats.published}
        />
        <StatCard 
          title="Failed"
          value={stats.failed}
          className={stats.failed > 0 ? "border-red-200" : ""}
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
            <CardDescription>Average views and engagement</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid gap-4 grid-cols-2">
              <StatCard 
                title="Avg. Views"
                value={stats.averageViews?.toLocaleString() || "N/A"}
                className="border-0 p-0"
              />
              <StatCard 
                title="Avg. Likes"
                value={stats.averageLikes?.toLocaleString() || "N/A"}
                className="border-0 p-0"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>Content split by platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[120px] text-center">
              <div className="text-muted-foreground">
                Chart will be displayed here with the platform distribution
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Content</h2>
          <Button variant="outline" asChild>
            <Link to="/content">View all content <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentContent.map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${content.sourcePlatform === "tiktok" ? "bg-black" : "bg-red-600"}`}>
                    {content.sourcePlatform === "tiktok" ? (
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
                        <path
                          fill="currentColor"
                          d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
                        <path
                          fill="currentColor"
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                        />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{content.title}</h3>
                      {content.status === "published" && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Published
                        </Badge>
                      )}
                      {content.status === "pending" && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending
                        </Badge>
                      )}
                      {content.status === "processing" && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          Processing
                        </Badge>
                      )}
                      {content.status === "failed" && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          Failed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span className="mr-1">From {content.sourcePlatform}</span>
                      <ArrowRight className="mx-1 h-3 w-3" />
                      <span>To {content.targetPlatform}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {content.createdAt.toLocaleDateString()} at {content.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {content.status === "failed" && content.error && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-red-500">{content.error}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {content.status === "published" && content.views && content.likes && (
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{content.views.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{content.likes.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Likes</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
