
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "./StatCard";
import { DashboardStats } from "@/types";

interface PerformanceMetricsProps {
  stats: DashboardStats;
}

const PerformanceMetrics = ({ stats }: PerformanceMetricsProps) => {
  return (
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
  );
};

export default PerformanceMetrics;
