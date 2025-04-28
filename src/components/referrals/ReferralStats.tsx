
import { Users, CreditCard } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { ReferralStats as ReferralStatsType } from "@/hooks/useReferralDashboard";

interface ReferralStatsProps {
  stats: ReferralStatsType | null;
}

const ReferralStats = ({ stats }: ReferralStatsProps) => {
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (!stats) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      <StatCard 
        title="Utilisateurs parrainés"
        value={stats.totalReferrals}
        icon={<Users className="h-5 w-5 text-brand-purple" />}
      />
      <StatCard 
        title="Commissions totales"
        value={formatCurrency(stats.totalCommissions)}
        icon={<CreditCard className="h-5 w-5 text-brand-purple" />}
      />
      <StatCard 
        title="Commissions en attente"
        value={formatCurrency(stats.pendingCommissions)}
        icon={<CreditCard className="h-5 w-5 text-brand-purple" />}
      />
    </div>
  );
};

export default ReferralStats;
