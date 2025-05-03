
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

// Function to generate a unique referral code
const generateReferralCode = (): string => {
  // Generate a short code based on uuid but easier to read/copy
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
        let { data: referralData, error: fetchError } = await supabase
          .from('referrals')
          .select('referral_code')
          .eq('user_id', user.id)
          .single();
          
        // Log any fetch errors
        if (fetchError) {
          console.error("Error fetching referral code:", fetchError);
        }
          
        // If user doesn't have a referral code, create one
        if (!referralData) {
          console.log("No referral code found, creating new one");
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
          console.log("Created new referral code:", referralCode);
        } else {
          console.log("Found existing referral code:", referralData.referral_code);
        }
        
        // Get referred users with their email addresses
        const { data: referredUsersData, error: referredUsersError } = await supabase
          .from('referred_users')
          .select('id, user_id, joined_at')
          .eq('referred_by', user.id);
          
        if (referredUsersError) {
          console.error("Error fetching referred users:", referredUsersError);
        }
        
        console.log("Referred users data:", referredUsersData);
          
        // Get commissions
        const { data: commissionsData, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (commissionsError) {
          console.error("Error fetching commissions:", commissionsError);
        }
        
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
