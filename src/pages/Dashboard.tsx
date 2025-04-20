import { useUserStats } from "@/hooks/useUserStats";
import { useUserContent } from "@/hooks/useUserContent";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useUserStats();
  const { data: recentContent, isLoading: isLoadingContent } = useUserContent();

  if (isLoadingStats || isLoadingContent) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview and analytics for your content repurposing
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Total Content Repurposed"
            value={stats?.totalRepurposed || 0}
            className="bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all"
          />
          <StatCard 
            title="Pending"
            value={stats?.pending || 0}
            className="bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all"
          />
          <StatCard 
            title="Published"
            value={stats?.published || 0}
            className="bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all"
          />
          <StatCard 
            title="Failed"
            value={stats?.failed || 0}
            className={`bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all ${
              stats?.failed ? "border-red-200" : ""
            }`}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                Content Performance
              </CardTitle>
              <CardDescription>Average views and engagement</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid gap-4 grid-cols-2">
                <StatCard 
                  title="Avg. Views"
                  value={(stats?.averageViews || 0).toLocaleString()}
                  className="border-0 p-0"
                />
                <StatCard 
                  title="Avg. Likes"
                  value={(stats?.averageLikes || 0).toLocaleString()}
                  className="border-0 p-0"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/50 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                Platform Distribution
              </CardTitle>
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
        
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
              Recent Content
            </h2>
            <Button variant="outline" asChild className="bg-white/50">
              <Link to="/content">
                View all content <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {(recentContent || []).slice(0, 4).map((content) => (
              <Card key={content.id} className="overflow-hidden bg-white/30 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all">
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
                          {new Date(content.createdAt).toLocaleDateString()} at {new Date(content.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                  
                  {content.status === "published" && (
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{stats?.averageViews?.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-semibold">{stats?.averageLikes?.toLocaleString()}</p>
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
    </div>
  );
};

const StatCard = ({ title, value, className = "" }: { title: string; value: number | string; className?: string }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1">
            <span className="text-3xl font-bold">{value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
