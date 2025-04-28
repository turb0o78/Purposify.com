
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalCommissions: number;
  pendingCommissions: number;
  referralUrl: string;
}

export interface ReferredUser {
  id: string;
  email: string;
  joinedAt: Date;
}

export interface Commission {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "available" | "paid";
  createdAt: Date;
  paidAt?: Date;
}

export const useReferralDashboard = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['referral-dashboard'],
    queryFn: async (): Promise<{
      stats: ReferralStats | null;
      referrals: ReferredUser[];
      commissions: Commission[];
    }> => {
      if (!user) {
        return { stats: null, referrals: [], commissions: [] };
      }
      
      try {
        // Get referral code
        const { data: referralData } = await supabase
          .from('referrals')
          .select('referral_code')
          .eq('user_id', user.id)
          .single();
          
        if (!referralData) {
          return { stats: null, referrals: [], commissions: [] };
        }
        
        // Get referred users
        const { data: referredUsersData } = await supabase
          .from('referred_users')
          .select(`
            id, 
            user_id,
            joined_at,
            auth_users:user_id(email)
          `)
          .eq('referred_by', user.id);
          
        // Get commissions
        const { data: commissionsData } = await supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        // Calculate totals
        const totalCommissions = (commissionsData || []).reduce(
          (sum, commission) => sum + Number(commission.amount),
          0
        );
        
        const pendingCommissions = (commissionsData || [])
          .filter(commission => commission.status === 'pending')
          .reduce(
            (sum, commission) => sum + Number(commission.amount),
            0
          );
        
        // Format the data
        const stats: ReferralStats = {
          referralCode: referralData.referral_code,
          totalReferrals: (referredUsersData || []).length,
          totalCommissions,
          pendingCommissions,
          referralUrl: `${window.location.origin}/auth?ref=${referralData.referral_code}`
        };
        
        const referrals: ReferredUser[] = (referredUsersData || []).map(user => ({
          id: user.id,
          email: user.auth_users?.email || 'Unknown user',
          joinedAt: new Date(user.joined_at)
        }));
        
        const commissions: Commission[] = (commissionsData || []).map(commission => ({
          id: commission.id,
          amount: Number(commission.amount),
          currency: commission.currency,
          status: commission.status as "pending" | "available" | "paid",
          createdAt: new Date(commission.created_at),
          paidAt: commission.paid_at ? new Date(commission.paid_at) : undefined
        }));
        
        return {
          stats,
          referrals,
          commissions
        };
      } catch (error) {
        console.error("Error fetching referral dashboard:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
