import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TiktokIcon, YoutubeIcon } from "@/components/icons";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    "Automatic content republishing",
    "Smart platform integration",
    "Watermark removal",
    "Custom scheduling",
    "Analytics tracking",
    "Backup your content",
  ];

  const stats = [
    { number: "250K+", label: "Videos Republished" },
    { number: "50K+", label: "Active Creators" },
    { number: "2M+", label: "Views Generated" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-brand-purple to-brand-blue-dark bg-clip-text text-transparent">
            Simplify Your Content Republishing
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Automatically repurpose and republish your content across TikTok and YouTube.
            Save time while maximizing your reach.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg"
              className="bg-brand-purple hover:bg-brand-purple/90 text-white px-8"
              onClick={() => navigate("/dashboard")}
            >
              Start Republishing <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate("/connections")}
              className="border-brand-purple text-brand-purple hover:bg-brand-purple/10"
            >
              Connect Platforms
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {stats.map((stat) => (
              <div key={stat.label} className="p-6 rounded-lg bg-white shadow-lg">
                <div className="text-4xl font-bold text-brand-purple mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Grow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div 
                key={feature} 
                className="p-6 rounded-lg border border-gray-200 hover:border-brand-purple transition-colors"
              >
                <div className="flex items-center mb-4">
                  <Check className="text-brand-purple mr-2" />
                  <h3 className="text-xl font-semibold">{feature}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Simple Pricing for Everyone
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold mb-4">Starter</h3>
              <div className="text-4xl font-bold mb-6">$19<span className="text-xl text-gray-600">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="text-brand-purple mr-2" />
                  <span>Up to 50 videos per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-brand-purple mr-2" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-brand-purple mr-2" />
                  <span>2 connected platforms</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-brand-purple hover:bg-brand-purple/90"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-brand-purple">
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-6">$49<span className="text-xl text-gray-600">/mo</span></div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="text-brand-purple mr-2" />
                  <span>Unlimited videos</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-brand-purple mr-2" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="text-brand-purple mr-2" />
                  <span>Unlimited platforms</span>
                </li>
              </ul>
              <Button 
                className="w-full bg-brand-purple hover:bg-brand-purple/90"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-600">
            <Link to="/privacy" className="hover:text-brand-purple">Privacy Policy</Link>
            <span className="hidden md:inline">•</span>
            <Link to="/terms" className="hover:text-brand-purple">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
