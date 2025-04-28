
import { useUserStats } from "@/hooks/useUserStats";
import { useUserContent } from "@/hooks/useUserContent";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import RecentContent from "@/components/dashboard/RecentContent";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, User } from "lucide-react";
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
        
        {/* Quick Access to settings */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="border border-white/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-brand-purple" />
                Paramètres du compte
              </CardTitle>
              <CardDescription>
                Gérez vos informations personnelles et préférences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mettez à jour votre profil, changez votre mot de passe, et gérez vos préférences d'email.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/settings/account">
                  Gérer le compte
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-white/20 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5 text-brand-purple" />
                Abonnement
              </CardTitle>
              <CardDescription>
                Gérez votre plan d'abonnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Consultez votre plan actuel, mettez à niveau, ou gérez vos informations de paiement.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/settings/subscription">
                  Gérer l'abonnement
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
