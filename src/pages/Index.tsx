
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, Play, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const videoRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "No Watermark",
      description: "Clean content without any watermarks"
    },
    {
      title: "No Manual Downloading of Videos",
      description: "Automatic processing of your content"
    },
    {
      title: "Automatically Publish or Schedule Your Content",
      description: "Set and forget with our scheduling system"
    },
    {
      title: "Step-by-Step Videos and Resources",
      description: "Comprehensive guidance for content creation"
    },
    {
      title: "Live Chat Support",
      description: "Get help when you need it"
    }
  ];

  const pricingTiers = [
    {
      name: "Free Trial",
      description: "14-Day Free Trial. No credit card required",
      price: selectedBillingCycle === 'monthly' ? '0$' : '0$',
      period: "",
      features: [
        "Connect 1 Account per Social Media",
        "Publish 10 Videos",
        "Connections to TikTok, YouTube, Instagram, Pinterest, Google Drive",
        "Chat Support"
      ],
      action: "Start free trial",
      popular: false
    },
    {
      name: "Basic",
      description: "Perfect for small creators and businesses",
      price: selectedBillingCycle === 'monthly' ? '8$' : '96$',
      period: selectedBillingCycle === 'monthly' ? '/month' : '/year',
      features: [
        "Connect 1 Account per Social Media",
        "Publish 25 Videos",
        "Connections to TikTok, YouTube, Instagram, Pinterest, Google Drive",
        "Chat Support"
      ],
      action: "Start free trial",
      popular: true
    },
    {
      name: "Pro",
      description: "For growing creators and teams",
      price: selectedBillingCycle === 'monthly' ? '18$' : '216$',
      period: selectedBillingCycle === 'monthly' ? '/month' : '/year',
      features: [
        "Connect 1 Account per Social Media",
        "Publish 25 Videos",
        "Connections to TikTok, YouTube, Instagram, Pinterest, Google Drive",
        "Chat Support"
      ],
      action: "Start free trial",
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Hero Section */}
      <header className="py-4 md:py-6 border-b border-gray-100">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="font-bold text-2xl text-blue-600">ReelStreamForge</div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="hidden md:inline-block"
              onClick={() => navigate("/auth")}
            >
              Log in
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/auth")}
            >
              Try for free
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                <span className="block">Create</span> 
                <span className="block">one post,</span> 
                <span className="text-blue-600">Publish</span> 
                <span className="block">it everywhere</span>
              </h1>
              <p className="text-lg text-gray-600">
                Elevate Your Reach Across Platforms effortlessly with ReShareIO. Republish your content without Watermark.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate("/auth")}
                >
                  Start free trial
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-300"
                  onClick={() => navigate("#demo")}
                >
                  <Play className="mr-2 h-4 w-4" />
                  View Demo
                </Button>
              </div>
            </div>
            <div className="md:w-1/2" ref={videoRef}>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src="/lovable-uploads/7de1f90f-28ea-411c-95ea-f78e347ff07a.png" 
                  alt="ReShareIO Demo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Trusted by more than <span className="text-blue-600">1,000</span> content creators
          </h2>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {/* Platform logos could be added here */}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <img 
                src="/lovable-uploads/7de1f90f-28ea-411c-95ea-f78e347ff07a.png" 
                alt="App screenshot" 
                className="w-full max-w-sm mx-auto rounded-3xl shadow-lg"
              />
            </div>
            <div className="md:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">What Benefits Will You Get?</h2>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.title} className="feature-check">
                    <CheckCircle2 className="text-blue-600" />
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Expand Your Audience?</h2>
            <p className="text-xl text-gray-600 mb-8">Choose Plan that's Right For You</p>
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-full">
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedBillingCycle === 'monthly' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedBillingCycle('monthly')}
              >
                Bill Monthly
              </button>
              <button 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedBillingCycle === 'yearly' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedBillingCycle('yearly')}
              >
                Bill Yearly
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div 
                key={tier.name}
                className={cn(
                  "price-card",
                  tier.popular && "highlighted"
                )}
              >
                <h3 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                <p className={`text-sm mb-4 h-12 ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>{tier.description}</p>
                <div className="flex items-baseline mb-6">
                  <span className={`text-3xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>{tier.price}</span>
                  <span className={`ml-1 ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>{tier.period}</span>
                </div>
                <div className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className={`h-5 w-5 mr-2 ${tier.popular ? 'text-white' : 'text-blue-600'}`} />
                      <span className={`text-sm ${tier.popular ? 'text-white/90' : 'text-gray-600'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className={`w-full ${tier.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  onClick={() => navigate("/auth")}
                >
                  {tier.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-8">
            <div className="mb-8 md:mb-0">
              <h3 className="font-bold text-2xl mb-4">ReShareIO</h3>
              <p className="text-gray-400 max-w-xs">
                Your automation companion for content repurposing and scheduling
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} ReShareIO. All rights reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms & Conditions
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
          
          {/* Newsletter Subscription */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <h4 className="font-semibold mb-4 md:mb-0">Subscribe to get our Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-gray-800 text-white rounded-l-md focus:outline-none"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 rounded-l-none">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
