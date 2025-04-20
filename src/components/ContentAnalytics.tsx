import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardStats } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

interface ContentAnalyticsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const ContentAnalytics = ({ stats, isLoading = false }: ContentAnalyticsProps) => {
  const chartData = [
    { name: "Published", value: stats.month.published, color: "#10b981" },
    { name: "Pending", value: stats.month.pending, color: "#eab308" },
    { name: "Failed", value: stats.month.failed, color: "#ef4444" },
  ];

  const statCards = [
    { 
      title: "Total Repurposed", 
      value: stats.month.totalRepurposed,
      change: "+12%",
      isPositive: true
    },
    { 
      title: "Published", 
      value: stats.month.published,
      change: "+8%",
      isPositive: true
    },
    { 
      title: "Pending", 
      value: stats.month.pending,
      change: "-3%",
      isPositive: false
    },
    { 
      title: "Failed", 
      value: stats.month.failed,
      change: "-5%",
      isPositive: true
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="month">
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="total">All Time</TabsTrigger>
          </TabsList>
          
          <TabsContent value="month" className="pt-4">
            {isLoading ? (
              <div className="animate-pulse-subtle h-64 flex items-center justify-center">
                Loading analytics data...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {statCards.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className={`text-xs font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Other tabs have similar content structure */}
          <TabsContent value="today">
            <div className="h-64 flex items-center justify-center">
              Today's data content will appear here
            </div>
          </TabsContent>
          
          <TabsContent value="week">
            <div className="h-64 flex items-center justify-center">
              Weekly data content will appear here
            </div>
          </TabsContent>
          
          <TabsContent value="total">
            <div className="h-64 flex items-center justify-center">
              All-time data content will appear here
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ContentAnalytics;
