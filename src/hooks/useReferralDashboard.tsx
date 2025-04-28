
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

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

// Fonction pour générer un code de parrainage unique
const generateReferralCode = (): string => {
  // Générer un code court basé sur uuid mais plus facile à lire/copier
  return uuidv4().substring(0, 8).toUpperCase();
};

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
        // Get referral code or create one if it doesn't exist
        let { data: referralData } = await supabase
          .from('referrals')
          .select('referral_code')
          .eq('user_id', user.id)
          .single();
          
        // Si l'utilisateur n'a pas de code de parrainage, en créer un
        if (!referralData) {
          const referralCode = generateReferralCode();
          
          const { data: newReferralData, error: insertError } = await supabase
            .from('referrals')
            .insert({ 
              user_id: user.id, 
              referral_code: referralCode 
            })
            .select('referral_code')
            .single();
            
          if (insertError) {
            console.error("Error creating referral code:", insertError);
            throw insertError;
          }
          
          referralData = newReferralData;
        }
        
        // Get referred users with their emails
        const { data: referredUsersData } = await supabase
          .from('referred_users')
          .select('id, user_id, joined_at')
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
          email: user.user_id || 'Unknown user', // Using user_id as a temporary placeholder since we don't have direct access to emails
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
