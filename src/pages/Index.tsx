
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  // Auto-redirect to dashboard
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-blue">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
          ReelForge: Content Repurposing Platform
        </h1>
        <p className="text-xl text-white/90 mb-8">
          Automatically repurpose your content between TikTok and YouTube with our seamless platform.
          Maximize your reach without the extra work.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-white text-brand-purple hover:bg-white/90"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-white text-white hover:bg-white/10"
            onClick={() => navigate("/connections")}
          >
            Connect Platforms
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
