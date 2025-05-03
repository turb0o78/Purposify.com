
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

const Dashboard = () => {
  const { data: stats, isLoading: isLoadingStats } = useUserStats();
  const { data: recentContent, isLoading: isLoadingContent } = useUserContent();
  const { data: subscription } = useSubscription();

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

  const planFeatures = {
    trial: [
      "Connect 1 Account per Social Media",
      "Publish 10 Videos",
      "Connections to TikTok, YouTube, Instagram",
      "Access to basic analytics"
    ],
    basic: [
      "Connect 1 Account per Social Media",
      "Publish 25 Videos",
      "Connections to TikTok, YouTube, Instagram, Pinterest",
      "Access to detailed analytics",
      "Priority support"
    ],
    agency: [
      "Connect 5 Accounts per Social Media",
      "Unlimited Videos",
      "All platform connections",
      "Advanced analytics and reporting",
      "Dedicated account manager"
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DashboardHeader 
          title="Dashboard"
          description="Overview and analytics for your content repurposing"
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard 
            title="Total Content"
            value={stats?.totalRepurposed || 0}
            className="bg-white shadow-sm"
          />
          <StatCard 
            title="Pending"
            value={stats?.pending || 0}
            className="bg-white shadow-sm"
          />
          <StatCard 
            title="Published"
            value={stats?.published || 0}
            className="bg-white shadow-sm"
          />
          <StatCard 
            title="Failed"
            value={stats?.failed || 0}
            className={`bg-white shadow-sm ${
              stats?.failed ? "border-red-200" : ""
            }`}
          />
        </div>
        
        {/* Current plan overview */}
        <Card className="mb-8 bg-white shadow-sm border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Package className="mr-2 h-5 w-5 text-blue-600" />
              Your Current Plan: <span className="ml-2 text-blue-600 capitalize">{subscription?.plan || "Loading..."}</span>
            </CardTitle>
            <CardDescription>
              {subscription?.is_active 
                ? `Active until ${subscription?.subscription_ends_at || 'N/A'}`
                : subscription?.plan === 'trial'
                  ? `Trial ends on ${subscription?.trial_ends_at || 'N/A'}`
                  : "Your subscription is inactive"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Plan Features</h3>
                <ul className="space-y-2">
                  {subscription?.plan && planFeatures[subscription.plan]?.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Usage</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Videos Used</span>
                      <span className="font-medium">
                        {stats?.totalRepurposed || 0} / {subscription?.platform_limits?.videos || 'Unlimited'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{
                          width: subscription?.platform_limits?.videos
                            ? `${Math.min(((stats?.totalRepurposed || 0) / subscription.platform_limits.videos) * 100, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Connected Accounts</span>
                      <span className="font-medium">
                        {stats?.platforms || 0} / {subscription?.platform_limits?.platforms || 'Unlimited'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full" 
                        style={{
                          width: subscription?.platform_limits?.platforms
                            ? `${Math.min(((stats?.platforms || 0) / subscription.platform_limits.platforms) * 100, 100)}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button asChild variant="outline" className="mr-2">
                <Link to="/settings/account">Manage Account</Link>
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/settings/subscription">Upgrade Plan</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Update your profile, change your password, and manage your email preferences.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/settings/account">
                  Manage Account
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-blue-600" />
                Platform Connections
              </CardTitle>
              <CardDescription>
                Connect your social media accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect to TikTok, YouTube, Instagram and more platforms to start republishing your content.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/connections">
                  Manage Connections
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <PerformanceMetrics stats={stats} />
        
        <RecentContent recentContent={recentContent || []} />
      </div>
    </div>
  );
};

export default Dashboard;
