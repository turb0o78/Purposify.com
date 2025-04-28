
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

  // Store referral code in session storage
  useEffect(() => {
    if (referralCode) {
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
      // Call the track_referral function
      const { error } = await supabase.rpc('track_referral', {
        user_id: userId,
        referral_code: storedCode
      });
      
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
      }
    } catch (error) {
      console.error("Failed to track referral:", error);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-purple/80 to-brand-blue/80 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute inset-0 backdrop-blur-3xl" />
      
      {/* Floating orbs decoration */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-brand-purple/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-brand-blue/20 rounded-full blur-3xl animate-pulse" />
      
      <Card className="w-full max-w-md relative backdrop-blur-lg bg-white/90 border border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
            {isLogin ? "Welcome back" : "Create an account"}
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
                className="backdrop-blur-sm bg-white/50 border-white/20"
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
                  className="pr-10 backdrop-blur-sm bg-white/50 border-white/20"
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
            <Button type="submit" className="w-full bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-90 transition-opacity" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-purple hover:text-brand-purple-dark font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
          {referralCode && !isLogin && (
            <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800 flex items-center">
                <UserPlus className="h-4 w-4 mr-1" />
                Signing up with referral: {referralCode}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
