
import { useState } from 'react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useReferralDashboard } from "@/hooks/useReferralDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReferralLink from "@/components/referrals/ReferralLink";
import ReferralStats from "@/components/referrals/ReferralStats";
import ReferredUsers from "@/components/referrals/ReferredUsers";
import CommissionsHistory from "@/components/referrals/CommissionsHistory";

const Referrals = () => {
  const { data, isLoading } = useReferralDashboard();
  const [activeTab, setActiveTab] = useState("overview");

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DashboardHeader
          title="Parrainage"
          description="Invitez vos amis et gagnez des commissions"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded w-full" />
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
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Programme de parrainage"
        description="Invitez vos amis et gagnez 50% de leur abonnement"
      />

      <ReferralLink stats={data?.stats} />
      
      {data?.stats && <ReferralStats stats={data.stats} />}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-2 mb-4">
          <TabsTrigger value="overview">Utilisateurs parrainés</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <ReferredUsers referrals={data?.referrals || []} />
        </TabsContent>
        
        <TabsContent value="commissions">
          <CommissionsHistory commissions={data?.commissions || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Referrals;
