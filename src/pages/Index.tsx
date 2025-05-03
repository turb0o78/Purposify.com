
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Globe, 
  Users, 
  Award, 
  Rocket, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";
import PurposifyLogo from "@/components/PurposifyLogo";

const Index = () => {
  const navigate = useNavigate();
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const videoRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add a slight delay before showing the video to ensure it loads properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setVideoLoaded(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      title: "No Watermark",
      description: "Clean content without any visible watermarks"
    },
    {
      title: "No Manual Downloading Required",
      description: "Automatic processing of your content"
    },
    {
      title: "Automated Publishing & Scheduling",
      description: "Set and forget with our intelligent scheduling system"
    },
    {
      title: "Step-by-Step Resources",
      description: "Comprehensive guidance for content creation"
    },
    {
      title: "Premium Support",
      description: "Get help when you need it from our team"
    }
  ];

  const platformFeatures = [
    {
      icon: <Globe className="h-10 w-10 mb-4 text-blue-600" />,
      title: "Multi-Platform Publishing",
      description: "Share your content across TikTok, YouTube, Instagram and more with just one click"
    },
    {
      icon: <Users className="h-10 w-10 mb-4 text-blue-600" />,
      title: "Grow Your Audience",
      description: "Expand your reach by publishing to multiple platforms simultaneously"
    },
    {
      icon: <Award className="h-10 w-10 mb-4 text-blue-600" />,
      title: "Professional Results",
      description: "Ensure your content looks great everywhere with platform-specific optimizations"
    },
    {
      icon: <Rocket className="h-10 w-10 mb-4 text-blue-600" />,
      title: "Save Time & Effort",
      description: "Focus on creating great content, not on the technical details of publishing"
    }
  ];

  const pricingTiers = [
    {
      name: "Free Trial",
      description: "14-Day Free Trial. No credit card required",
      price: "0",
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
      price: selectedBillingCycle === 'monthly' ? '8' : '96',
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
      price: selectedBillingCycle === 'monthly' ? '18' : '216',
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

  const testimonials = [
    {
      content: "Purposify has completely transformed how I manage my content. I'm saving hours every week!",
      author: "Sarah Johnson",
      title: "Content Creator"
    },
    {
      content: "The ability to post across platforms without watermarks has increased my engagement by over 30%",
      author: "Michael Chen",
      title: "Digital Marketer"
    },
    {
      content: "This tool paid for itself within the first week. The time I save is worth every penny.",
      author: "Aisha Williams",
      title: "Social Media Manager"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Hero Section */}
      <header className={cn(
        "py-4 fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        scrolled ? "bg-white/95 backdrop-blur-sm border-gray-100 shadow-sm" : ""
      )}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <PurposifyLogo className="h-8" />
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</a>
          </div>
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
      <section className="pt-32 pb-24 relative overflow-hidden hero-gradient">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="md:w-1/2 space-y-8">
              <div>
                <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">
                  Simplify Your Content Strategy
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="block">Create</span> 
                <span className="block">once,</span> 
                <span className="text-blue-600">publish</span> 
                <span className="block">everywhere</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-md">
                Elevate your online presence across platforms with Purposify. Republish your content without watermarks, saving time and maximizing impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 font-medium px-6 py-6 text-base"
                  onClick={() => navigate("/auth")}
                >
                  Start your free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-300 font-medium px-6 py-6 text-base"
                  onClick={() => {
                    const demoSection = document.getElementById('how-it-works');
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch how it works
                </Button>
              </div>
              <div className="hidden md:block">
                <p className="text-sm text-gray-500">Trusted by 1,000+ content creators worldwide</p>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-500">4.9/5 stars</span>
                </div>
              </div>
            </div>
            
            {/* Demo Video section */}
            <div className="md:w-1/2 relative" ref={videoRef}>
              <div className="absolute -inset-4 bg-blue-100/30 rounded-full blur-3xl opacity-70 blob-animation"></div>
              <div className="relative">
                <div className="aspect-video bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-xl shadow-blue-100/50">
                  {videoLoaded && (
                    <div className="w-full h-full">
                      <iframe 
                        src="https://player.vimeo.com/video/1081138035?h=750b66a650&autoplay=1&loop=1&background=1&quality=auto" 
                        className="w-full h-full"
                        frameBorder="0" 
                        allow="autoplay; fullscreen; picture-in-picture" 
                        allowFullScreen
                        title="Purposify Demo Video"
                      ></iframe>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Live Demo
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Wave decoration */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
              <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
            </svg>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Maximize Your Content Reach</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Create once and publish to multiple platforms without watermarks or manual downloading
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {platformFeatures.map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-300">
                {feature.icon}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Purposify Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to transform your content strategy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect Your Accounts",
                description: "Link your social media platforms securely in just a few clicks"
              },
              {
                step: "02",
                title: "Upload Your Content",
                description: "Upload your videos once to our secure platform"
              },
              {
                step: "03",
                title: "Publish Everywhere",
                description: "Schedule and publish to all your platforms automatically"
              }
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="text-9xl font-bold text-gray-100 absolute -top-6 -right-6">{step.step}</div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-xl font-bold text-blue-600">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button
              className="bg-blue-600 hover:bg-blue-700 font-medium px-6 py-6 text-base"
              onClick={() => navigate("/auth")}
            >
              Get started now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-blue-100/30 rounded-full blur-3xl opacity-70 blob-animation"></div>
              <div className="relative rounded-3xl overflow-hidden border-8 border-white shadow-2xl">
                <img 
                  src="/lovable-uploads/7de1f90f-28ea-411c-95ea-f78e347ff07a.png" 
                  alt="App screenshot" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">What Benefits Will You Get?</h2>
              <div className="space-y-6">
                {features.map((feature) => (
                  <div key={feature.title} className="feature-check">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="text-blue-600 w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/auth")}
              >
                Start your free trial
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't take our word for it - hear from content creators who've transformed their workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24" id="pricing">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Expand Your Audience?</h2>
            <p className="text-xl text-gray-600 mb-8">Choose the Plan that's Right For You</p>
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-full">
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedBillingCycle === 'monthly' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedBillingCycle('monthly')}
              >
                Bill Monthly
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedBillingCycle === 'yearly' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedBillingCycle('yearly')}
              >
                Bill Yearly <span className="text-xs text-green-600 font-medium ml-1">Save 20%</span>
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
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-2 ${tier.popular ? 'text-white' : 'text-gray-900'}`}>{tier.name}</h3>
                <p className={`text-sm mb-6 h-12 ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>{tier.description}</p>
                <div className="flex items-baseline mb-6">
                  <span className={`text-5xl font-bold ${tier.popular ? 'text-white' : 'text-gray-900'}`}>${tier.price}</span>
                  <span className={`ml-1 ${tier.popular ? 'text-white/80' : 'text-gray-500'}`}>{tier.period}</span>
                </div>
                <div className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <Check className={`h-5 w-5 mr-3 ${tier.popular ? 'text-white' : 'text-blue-600'}`} />
                      <span className={`text-sm ${tier.popular ? 'text-white/90' : 'text-gray-600'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className={`w-full py-6 ${tier.popular ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  onClick={() => navigate("/auth")}
                >
                  {tier.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <div className="inline-flex items-center p-4 bg-blue-50 rounded-lg">
              <ShieldCheck className="text-blue-600 h-6 w-6 mr-3" />
              <span className="text-sm">All plans come with a 14-day free trial. No credit card required.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Ready to streamline your content workflow?</h2>
              <p className="text-lg text-blue-100">Join thousands of creators who are saving time and growing their audience.</p>
            </div>
            <div>
              <Button 
                className="bg-white text-blue-600 hover:bg-gray-100 py-6 px-8 text-lg"
                onClick={() => navigate("/auth")}
              >
                Start your free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between mb-12">
            <div className="mb-8 md:mb-0 md:w-1/3">
              <div className="mb-4">
                <PurposifyLogo variant="white" />
              </div>
              <p className="text-gray-400 max-w-xs">
                Your automation companion for content repurposing and scheduling across multiple platforms.
              </p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Updates</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Guides</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Docs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                  <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} Purposify. All rights reserved.
              </p>
              <div className="flex gap-6">
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookie Settings
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
