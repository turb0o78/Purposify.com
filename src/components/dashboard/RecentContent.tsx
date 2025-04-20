
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Content } from "@/types";

interface RecentContentProps {
  recentContent: Content[];
}

const RecentContent = ({ recentContent }: RecentContentProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
          Recent Content
        </h2>
        <Button variant="outline" asChild className="bg-white/50">
          <Link to="/content">
            View all content <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="space-y-4">
        {(recentContent || []).slice(0, 4).map((content) => (
          <Card key={content.id} className="overflow-hidden bg-white/30 backdrop-blur-sm border-white/10 hover:shadow-lg transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${content.sourcePlatform === "tiktok" ? "bg-black" : "bg-red-600"}`}>
                  {content.sourcePlatform === "tiktok" ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
                      <path
                        fill="currentColor"
                        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-white">
                      <path
                        fill="currentColor"
                        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                      />
                    </svg>
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{content.title}</h3>
                    {content.status === "published" && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Published
                      </Badge>
                    )}
                    {content.status === "pending" && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        Pending
                      </Badge>
                    )}
                    {content.status === "processing" && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                        Processing
                      </Badge>
                    )}
                    {content.status === "failed" && (
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        Failed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                    <span className="mr-1">From {content.sourcePlatform}</span>
                    <ArrowRight className="mx-1 h-3 w-3" />
                    <span>To {content.targetPlatform}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(content.createdAt).toLocaleDateString()} at {new Date(content.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    
                    {content.status === "failed" && content.error && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-red-500">{content.error}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentContent;
