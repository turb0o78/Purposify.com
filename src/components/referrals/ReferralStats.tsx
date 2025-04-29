
import { Users, CreditCard } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { ReferralStats as ReferralStatsType } from "@/hooks/useReferralDashboard";

interface ReferralStatsProps {
  stats: ReferralStatsType | null;
}

const ReferralStats = ({ stats }: ReferralStatsProps) => {
  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    // Enhanced currency formatter to better support different locales
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch (error) {
      console.error("Error formatting currency:", error);
      // Fallback formatting if there's an issue with the NumberFormat
      return `${amount.toFixed(2)} ${currency}`;
    }
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
