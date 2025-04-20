
import { useState } from "react";
import { Connection } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ConnectionCard from "@/components/ConnectionCard";
import { toast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";

// Mock data for initial connections state
const mockConnections: Connection[] = [
  {
    id: "tiktok-1",
    platform: "tiktok",
    name: "TikTok Demo",
    status: "connected",
    connected_at: new Date(),
  },
  {
    id: "youtube-1",
    platform: "youtube",
    name: "YouTube Demo",
    status: "connected",
    connected_at: new Date(),
  },
];

const emptyConnections: Partial<Connection>[] = [
  {
    platform: "tiktok",
    status: "disconnected",
  },
  {
    platform: "youtube",
    status: "disconnected",
  },
];

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>(mockConnections);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const handleConnect = (platform: Connection['platform']) => {
    setConnecting(true);
    setConnectingPlatform(platform);

    // Simulate the OAuth flow - in production this would redirect to the platform auth
    const platformConfig = {
      tiktok: {
        clientId: "sbawa90yd34c5s6msg",
        redirectUri: "https://opaldesign.fr/dashboard/connections",
      },
      youtube: {
        clientId: "716459993916-dtfg52nflg5jdrna5vtg2h4ahupvt7bs.apps.googleusercontent.com",
        redirectUri: "https://opaldesign.fr/dashboard/connections",
      },
    };

    // In a real app, this would redirect to the OAuth URL
    console.log(`Connecting to ${platform} with config:`, platformConfig[platform]);
    
    // Instead, we'll simulate a successful connection after a delay
    setTimeout(() => {
      const newConnection: Connection = {
        id: `${platform}-${Date.now()}`,
        platform,
        name: platform === "tiktok" ? "TikTok Account" : "YouTube Channel",
        status: "connected",
        connected_at: new Date(),
      };
      
      setConnections(prev => [...prev.filter(c => c.platform !== platform), newConnection]);
      setConnecting(false);
      setConnectingPlatform(null);
      
      toast({
        title: "Connection successful",
        description: `Your ${platform === "tiktok" ? "TikTok" : "YouTube"} account has been connected.`,
        action: (
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        ),
      });
    }, 2000);
  };

  const getConnectionByPlatform = (platform: Connection['platform']): Partial<Connection> => {
    const existingConnection = connections.find(c => c.platform === platform);
    if (existingConnection) {
      return existingConnection;
    }
    
    return emptyConnections.find(c => c.platform === platform) || { platform, status: "disconnected" };
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Platform Connections</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to enable content repurposing
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConnectionCard 
          connection={getConnectionByPlatform("tiktok")}
          onConnect={handleConnect}
          isConnecting={connecting && connectingPlatform === "tiktok"}
        />
        
        <ConnectionCard 
          connection={getConnectionByPlatform("youtube")}
          onConnect={handleConnect}
          isConnecting={connecting && connectingPlatform === "youtube"}
        />
      </div>
      
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Connection Details</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Technical information about your platform connections
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">TikTok API</h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client ID</p>
                    <code className="text-sm bg-gray-200 p-1 rounded">sbawa90yd34c5s6msg</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client Secret</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-200 p-1 rounded">gw5030vHFpcnNukdDsdcXgyXxEXkRwtm</code>
                      <Button variant="ghost" size="sm" className="h-6">Copy</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Redirect URI</p>
                    <code className="text-sm bg-gray-200 p-1 rounded">https://opaldesign.fr/dashboard/connections</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className={connections.some(c => c.platform === "tiktok") ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                      {connections.some(c => c.platform === "tiktok") ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">YouTube API</h3>
              <div className="bg-gray-100 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client ID</p>
                    <code className="text-sm bg-gray-200 p-1 rounded">716459993916-dtfg52nflg5jdrna5vtg2h4ahupvt7bs.apps.googleusercontent.com</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Client Secret</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-gray-200 p-1 rounded">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</code>
                      <Button variant="ghost" size="sm" className="h-6">Copy</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Redirect URI</p>
                    <code className="text-sm bg-gray-200 p-1 rounded">https://opaldesign.fr/dashboard/connections</code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className={connections.some(c => c.platform === "youtube") ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                      {connections.some(c => c.platform === "youtube") ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connections;
