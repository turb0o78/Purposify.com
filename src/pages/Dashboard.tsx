
import { useUserStats } from "@/hooks/useUserStats";
import { useUserContent } from "@/hooks/useUserContent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import RecentContent from "@/components/dashboard/RecentContent";

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
        <DashboardHeader 
          title="Dashboard"
          description="Overview and analytics for your content repurposing"
        />

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
        
        <PerformanceMetrics stats={stats} />
        
        <RecentContent recentContent={recentContent || []} />
      </div>
    </div>
  );
};

export default Dashboard;
