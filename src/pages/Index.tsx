
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronRight, Sparkles, Globe, Zap, Shield, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({
    features: false,
    pricing: false,
    testimonials: false
  });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  // Features section with improved descriptions
  const features = [
    {
      icon: <Globe className="h-6 w-6 text-brand-purple" />,
      title: "Multi-platform Publishing",
      description: "Seamlessly republish your content across TikTok, YouTube, and Pinterest with a single click."
    },
    {
      icon: <Zap className="h-6 w-6 text-brand-purple" />,
      title: "Smart Scheduling",
      description: "Optimize your reach with AI-powered scheduling that targets peak engagement times."
    },
    {
      icon: <Shield className="h-6 w-6 text-brand-purple" />,
      title: "Content Protection",
      description: "Watermark removal and intelligent content protection keeps your brand consistent."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-brand-purple" />,
      title: "Analytics Dashboard",
      description: "Track performance across all platforms with unified, real-time analytics."
    }
  ];

  // Pricing tiers with more compelling descriptions
  const pricingTiers = [
    {
      name: "Starter",
      price: "19€",
      period: "/month",
      description: "Perfect for content creators just getting started",
      features: [
        "Up to 50 videos per month",
        "Basic analytics",
        "2 connected platforms",
        "Standard support"
      ],
      action: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "49€",
      period: "/month",
      description: "For creators ready to scale their content strategy",
      features: [
        "Unlimited videos",
        "Advanced analytics",
        "All platforms supported",
        "Priority support",
        "Custom scheduling"
      ],
      action: "Upgrade to Pro",
      popular: true
    }
  ];

  // Testimonials with better quotes
  const testimonials = [
    {
      quote: "ReelStreamForge doubled my audience by helping me consistently publish across platforms I never had time for.",
      author: "Alex Morgan",
      role: "Content Creator"
    },
    {
      quote: "The analytics alone are worth the price. I now know exactly which content to focus on for maximum engagement.",
      author: "Sarah Chen",
      role: "Digital Marketer"
    },
    {
      quote: "I was spending 10+ hours a week just republishing content. Now it's automated and I can focus on creating.",
      author: "Marcus Johnson",
      role: "YouTuber"
    }
  ];

  // Mouse effect for hero section
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCursorPosition({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section with Interactive Background */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden py-20 md:py-32"
        style={{
          background: `radial-gradient(circle at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(139, 92, 246, 0.15), transparent 60%)`
        }}
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center rounded-full border border-brand-purple/30 bg-brand-purple/10 px-3 py-1 text-sm mb-6 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-brand-purple" />
              <span className="text-brand-purple font-medium">Revolutionizing content republishing</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-brand-purple-dark via-brand-purple to-brand-blue bg-clip-text text-transparent">
              Republish Content, <br/>Amplify Your Reach
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automatically repurpose and republish your content across TikTok, YouTube, and Pinterest.
              Save time while maximizing your audience.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg"
                className="bg-brand-purple hover:bg-brand-purple-dark text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-brand-purple/25 transition-all duration-300 hover:translate-y-[-2px]"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-brand-purple text-brand-purple hover:bg-brand-purple/10 px-8 py-6 text-lg rounded-xl"
                onClick={() => {
                  const featuresSection = document.getElementById("features");
                  featuresSection?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                See How It Works
              </Button>
            </div>
          </div>
          
          {/* Platform badges */}
          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            <div className="flex items-center bg-white p-3 rounded-xl shadow-sm">
              <div className="h-10 w-10 bg-black rounded-lg flex items-center justify-center mr-3">
                <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </div>
              <div className="text-xs text-gray-600">TikTok</div>
            </div>
            
            <div className="flex items-center bg-white p-3 rounded-xl shadow-sm">
              <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div className="text-xs text-gray-600">YouTube</div>
            </div>
            
            <div className="flex items-center bg-white p-3 rounded-xl shadow-sm">
              <div className="h-10 w-10 bg-red-700 rounded-lg flex items-center justify-center mr-3">
                <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                  <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.19-2.4.04-3.44.2-.97 1.3-6.16 1.3-6.16s-.34-.66-.34-1.65c0-1.55.9-2.7 2.01-2.7.95 0 1.4.7 1.4 1.56 0 .95-.6 2.37-.93 3.7-.27 1.1.56 2 1.66 2 1.98 0 3.51-2.1 3.51-5.13 0-2.68-1.93-4.55-4.67-4.55a4.75 4.75 0 0 0-4.94 4.8c0 .94.36 1.96.82 2.52.08.1.1.2.08.3-.08.35-.28 1.1-.32 1.25-.05.2-.17.25-.38.15-1.43-.67-2.32-2.75-2.32-4.42 0-3.54 2.56-6.77 7.4-6.77 3.88 0 6.87 2.77 6.87 6.47 0 3.86-2.4 6.97-5.73 6.97-1.12 0-2.17-.58-2.53-1.27l-.7 2.65c-.24.95-.9 2.13-1.33 2.85A12 12 0 1 0 12 0z" />
                </svg>
              </div>
              <div className="text-xs text-gray-600">Pinterest</div>
            </div>
          </div>
        </div>
        
        {/* Floating shapes for visual interest */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className={cn(
              "flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-500",
              isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h3 className="text-4xl font-bold text-brand-purple mb-2">250K+</h3>
              <p className="text-gray-600">Videos Republished</p>
            </div>
            
            <div className={cn(
              "flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-500 delay-100",
              isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h3 className="text-4xl font-bold text-brand-purple mb-2">50K+</h3>
              <p className="text-gray-600">Active Creators</p>
            </div>
            
            <div className={cn(
              "flex flex-col items-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-500 delay-200", 
              isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            )}>
              <h3 className="text-4xl font-bold text-brand-purple mb-2">2M+</h3>
              <p className="text-gray-600">Views Generated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm mb-6">
              <span className="text-gray-600 font-medium">Why ReelStreamForge?</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Grow</h2>
            <p className="text-xl text-gray-600">All the tools and features designed to maximize your content's reach and impact.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={cn(
                  "p-6 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-md hover:border-brand-purple/20",
                  isVisible.features ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                  `delay-${index * 100}`
                )}
              >
                <div className="h-12 w-12 rounded-lg bg-brand-purple/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-brand-purple text-brand-purple hover:bg-brand-purple/10"
            >
              Explore All Features <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm mb-6">
              <span className="text-gray-600 font-medium">Simple Process</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">How ReelStreamForge Works</h2>
            <p className="text-xl text-gray-600">Three simple steps to maximize your content's reach across platforms.</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Connection line */}
              <div className="absolute h-full w-0.5 bg-gray-200 left-6 top-0 hidden md:block"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center z-10">
                    <span className="text-brand-purple font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Connect Your Platforms</h3>
                    <p className="text-gray-600 mb-4">Link your TikTok, YouTube, and Pinterest accounts with just a few clicks. Our secure OAuth process makes connections simple and safe.</p>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                          <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                        </svg>
                      </div>
                      <div className="h-8 w-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                      <div className="h-8 w-8 bg-red-700 rounded-lg flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5">
                          <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.19-2.4.04-3.44.2-.97 1.3-6.16 1.3-6.16s-.34-.66-.34-1.65c0-1.55.9-2.7 2.01-2.7.95 0 1.4.7 1.4 1.56 0 .95-.6 2.37-.93 3.7-.27 1.1.56 2 1.66 2 1.98 0 3.51-2.1 3.51-5.13 0-2.68-1.93-4.55-4.67-4.55a4.75 4.75 0 0 0-4.94 4.8c0 .94.36 1.96.82 2.52.08.1.1.2.08.3-.08.35-.28 1.1-.32 1.25-.05.2-.17.25-.38.15-1.43-.67-2.32-2.75-2.32-4.42 0-3.54 2.56-6.77 7.4-6.77 3.88 0 6.87 2.77 6.87 6.47 0 3.86-2.4 6.97-5.73 6.97-1.12 0-2.17-.58-2.53-1.27l-.7 2.65c-.24.95-.9 2.13-1.33 2.85A12 12 0 1 0 12 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center z-10">
                    <span className="text-brand-purple font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Set Up Workflows</h3>
                    <p className="text-gray-600 mb-4">Create custom republishing workflows that automatically transform your content for each platform's specific requirements.</p>
                    <div className="relative h-40 w-full bg-gray-100 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-brand-blue/5"></div>
                      <div className="absolute top-4 left-4 right-4 h-8 bg-white rounded flex items-center px-3">
                        <div className="h-3 w-3 bg-brand-purple rounded-full mr-2"></div>
                        <div className="h-2 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="absolute top-16 left-4 right-4 h-8 bg-white rounded flex items-center px-3">
                        <div className="h-3 w-3 bg-gray-300 rounded-full mr-2"></div>
                        <div className="h-2 w-32 bg-gray-200 rounded"></div>
                      </div>
                      <div className="absolute top-28 left-4 right-4 h-8 bg-white rounded flex items-center px-3">
                        <div className="h-3 w-3 bg-gray-300 rounded-full mr-2"></div>
                        <div className="h-2 w-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-brand-purple/20 flex items-center justify-center z-10">
                    <span className="text-brand-purple font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Monitor & Optimize</h3>
                    <p className="text-gray-600 mb-4">Track performance across all platforms with our unified analytics dashboard. Continuously optimize your strategy based on real data.</p>
                    <div className="relative h-40 w-full bg-gray-100 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/5 to-brand-blue/5"></div>
                      <div className="absolute bottom-0 left-4 w-16 h-24 bg-brand-purple/80 rounded-t"></div>
                      <div className="absolute bottom-0 left-24 w-16 h-32 bg-brand-purple rounded-t"></div>
                      <div className="absolute bottom-0 left-44 w-16 h-16 bg-brand-purple/60 rounded-t"></div>
                      <div className="absolute bottom-0 left-64 w-16 h-20 bg-brand-purple/70 rounded-t"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm mb-6">
              <span className="text-gray-600 font-medium">Creator Stories</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">What Creators Say</h2>
            <p className="text-xl text-gray-600">Join thousands of content creators already growing with ReelStreamForge.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.author}
                className={cn(
                  "p-6 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-500",
                  isVisible.testimonials ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                  `delay-${index * 100}`
                )}
              >
                <div className="text-brand-purple mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className="text-brand-purple">★</span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm mb-6">
              <span className="text-gray-600 font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Plans for Every Creator</h2>
            <p className="text-xl text-gray-600">Choose the perfect plan to help you grow your audience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={cn(
                  "p-8 rounded-xl transition-all duration-500 relative",
                  tier.popular ? "border-2 border-brand-purple bg-white shadow-lg" : "border border-gray-200 bg-white",
                  isVisible.pricing ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                )}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-brand-purple text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-500 ml-1">{tier.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-5 w-5 text-brand-purple mr-2 flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={cn(
                    "w-full",
                    tier.popular 
                      ? "bg-brand-purple hover:bg-brand-purple-dark text-white" 
                      : "border-brand-purple text-brand-purple hover:bg-brand-purple/10"
                  )}
                  variant={tier.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  {tier.action}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-8 bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">
              Need a custom plan for your enterprise? <Button variant="link" className="text-brand-purple p-0">Contact our sales team</Button>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brand-purple to-brand-purple-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Amplify Your Content?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join thousands of creators who use ReelStreamForge to save time and reach more people.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")}
            className="bg-white text-brand-purple hover:bg-gray-100 px-8 py-6 text-lg rounded-xl"
          >
            Start Your Free Trial <ArrowRight className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="font-bold text-xl mb-2">ReelStreamForge</div>
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-brand-purple transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-brand-purple transition-colors">Terms & Conditions</Link>
              <a href="#features" className="hover:text-brand-purple transition-colors">Features</a>
              <a href="#pricing" className="hover:text-brand-purple transition-colors">Pricing</a>
              <a href="#" className="hover:text-brand-purple transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
