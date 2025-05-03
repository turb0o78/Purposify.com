
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, UserPlus, Check } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get("ref");
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Store referral code in session storage and database
  useEffect(() => {
    if (referralCode) {
      console.log("Referral code found in URL:", referralCode);
      sessionStorage.setItem("referralCode", referralCode);
      toast.info(
        <div className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Référé par un ami</span>
        </div>,
        {
          description: "Vous vous inscrivez avec un code de parrainage",
        }
      );
    }
  }, [referralCode]);

  const trackReferral = async (userId: string) => {
    const storedCode = sessionStorage.getItem("referralCode");
    if (!storedCode) return;
    
    try {
      console.log("Tracking referral for user:", userId, "with code:", storedCode);
      
      // First, add entry to referrals table
      const { data: referralData, error: referralError } = await supabase
        .from('referrals')
        .insert([
          { 
            referrer_code: storedCode,
            referred_user_id: userId,
            status: 'pending'
          }
        ]);
      
      console.log("Referral DB insert response:", { referralData, referralError });
      
      if (referralError) {
        console.error("Error inserting referral record:", referralError);
        throw referralError;
      }
      
      // Then call the track_referral function
      const { data, error } = await supabase.rpc('track_referral', {
        user_id: userId,
        referral_code: storedCode
      });
      
      console.log("Referral tracking response:", { data, error });
      
      if (!error) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>Parrainage enregistré</span>
          </div>
        );
        // Clear the stored code after successful tracking
        sessionStorage.removeItem("referralCode");
      } else {
        console.error("Error tracking referral:", error);
        toast.error("Erreur lors de l'enregistrement du parrainage");
      }
    } catch (error) {
      console.error("Failed to track referral:", error);
      toast.error("Erreur lors de l'enregistrement du parrainage");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Track referral if user just signed up and we have a userId
        if (data?.user?.id) {
          await trackReferral(data.user.id);
        }
        
        toast.success("Check your email to complete your registration!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">ReelStreamForge</h1>
          <p className="text-gray-600">Your all-in-one content republishing platform</p>
        </div>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Log in to your account" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Enter your details to create your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Loading..." : isLogin ? "Sign in" : "Sign up"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </div>
            {referralCode && !isLogin && (
              <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 flex items-center">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Signing up with referral: {referralCode}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
