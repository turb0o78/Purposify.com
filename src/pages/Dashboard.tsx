
import { useUserStats } from "@/hooks/useUserStats";
import { useUserContent } from "@/hooks/useUserContent";
import { useSubscription } from "@/hooks/useSubscription";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import RecentContent from "@/components/dashboard/RecentContent";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, User, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Globe, Upload, Radio, Share2 } from "lucide-react";
import { Content } from "@/types";

interface DashboardStats {
  videos_processed: number;
  videos_published: number;
  accounts_connected: number;
  views: number;
  likes: number;
  comments: number;
  platforms_connected: number; 
}

const Dashboard = () => {
  const { user } = useAuth();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: userContent } = useUserContent();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Format subscription end date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Calculate videos remaining
  const getVideosRemaining = () => {
    if (!subscription || !userStats) return 0;
    const limit = subscription.platform_limits?.videos || 0;
    return Math.max(0, limit - userStats.videos_processed);
  };
  
  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (!subscription || !userStats) return 0;
    const limit = subscription.platform_limits?.videos || 1;
    return Math.min(100, Math.round((userStats.videos_processed / limit) * 100));
  };

  // Helper function to get plan display name
  const getPlanName = () => {
    if (!subscription) return "Loading...";
    
    switch (subscription.plan) {
      case "trial":
        return "Free Trial";
      case "basic":
        return "Basic Plan";
      case "pro":
        return "Pro Plan";
      case "agency":
        return "Agency Plan";
      default:
        return "Unknown Plan";
    }
  };

  // Get subscription end date
  const getSubscriptionEndDate = () => {
    if (!subscription) return "Loading...";
    
    if (subscription.plan === "trial") {
      return `Trial ends on ${formatDate(subscription.trial_ends_at)}`;
    } else {
      return `Renews on ${formatDate(subscription.subscription_ends_at)}`;
    }
  };

  // Get recent content items
  const getRecentContent = (): Content[] => {
    if (!userContent?.items) return [];
    return userContent.items.slice(0, 4);
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <DashboardHeader 
        title="Dashboard"
        description="Welcome back! Here's an overview of your content performance."
      />
      
      {(statsLoading || subscriptionLoading) ? (
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Stats cards grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Videos Processed"
              value={userStats?.videos_processed || 0}
              trend={10}
              trendLabel="vs. last month"
              trendDirection="up"
            />
            <StatCard
              title="Videos Published"
              value={userStats?.videos_published || 0}
              trend={5}
              trendLabel="vs. last month"
              trendDirection="up"
            />
            <StatCard
              title="Accounts Connected"
              value={userStats?.accounts_connected || 0}
              trend={0}
              trendLabel="unchanged"
              trendDirection="neutral"
            />
            <StatCard
              title="Platforms Connected"
              value={userStats?.platforms_connected || 0}
              trend={0}
              trendLabel="new additions"
              trendDirection="neutral"
            />
          </div>
          
          {/* Current plan and usage */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium text-gray-900">{getPlanName()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500">Status</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscription?.is_active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {subscription?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500">Renewal</span>
                    <span className="text-gray-900">{getSubscriptionEndDate()}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-blue-600"
                  variant="default"
                  onClick={() => navigate('/settings/subscription')}
                >
                  {subscription?.plan === "trial" ? "Upgrade Plan" : "Manage Plan"}
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Usage This Month</h3>
                <span className="text-sm text-gray-500">
                  {userStats?.videos_processed || 0} / {subscription?.platform_limits?.videos || 0} videos
                </span>
              </div>
              
              <Progress 
                value={getUsagePercentage()}
                className="h-2 mb-6"
                indicatorColor={getUsagePercentage() > 80 ? "bg-red-500" : "bg-blue-600"}
              />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Videos remaining</p>
                  <p className="text-2xl font-semibold">{getVideosRemaining()}</p>
                </div>
                {getUsagePercentage() > 80 && (
                  <Button variant="outline" onClick={() => navigate('/settings/subscription')}>
                    Upgrade for more
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Shortcuts section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
            
            <div className="grid gap-4 md:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-6 border-dashed"
                onClick={() => navigate('/connections')}
              >
                <Globe className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-sm font-medium">Connect Account</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-6 border-dashed"
                onClick={() => navigate('/content')}
              >
                <Upload className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-sm font-medium">Upload Content</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-6 border-dashed"
                onClick={() => navigate('/workflows/new')}
              >
                <Radio className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-sm font-medium">Create Workflow</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto flex flex-col items-center justify-center p-6 border-dashed"
                onClick={() => navigate('/referrals')}
              >
                <Share2 className="h-8 w-8 mb-2 text-blue-600" />
                <span className="text-sm font-medium">Invite Friends</span>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <PerformanceMetrics stats={userStats} />
            <RecentContent recentContent={getRecentContent()} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
