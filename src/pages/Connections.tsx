
import { useState, useEffect } from "react";
import { Connection, Platform } from "@/types";
import { Button } from "@/components/ui/button";
import ConnectionCard from "@/components/ConnectionCard";
import { toast } from "@/components/ui/use-toast";
import { Check, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

// Define empty connections array with updated platforms
const emptyConnections: Partial<Connection>[] = [
  {
    platform: "tiktok",
    status: "disconnected",
  },
  {
    platform: "youtube",
    status: "disconnected",
  },
  {
    platform: "instagram",
    status: "disconnected",
  },
  {
    platform: "facebook",
    status: "disconnected",
  },
  {
    platform: "google_drive",
    status: "disconnected",
  },
  {
    platform: "dropbox",
    status: "disconnected",
  },
  {
    platform: "pinterest",
    status: "disconnected",
  }
];

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();

  // Check for current user session
  useEffect(() => {
    const checkUser = async () => {
      setAuthLoading(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Auth error:", error);
        }
        setUser(session?.user || null);
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkUser();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check URL parameters for OAuth callback results
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast({
        title: "Connection successful",
        description: "Your account has been connected successfully.",
        action: (
          <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        ),
      });
      // Clear URL params after displaying toast
      navigate("/connections", { replace: true });
    } else if (error) {
      toast({
        title: "Connection failed",
        description: decodeURIComponent(error),
        variant: "destructive",
      });
      // Clear URL params after displaying toast
      navigate("/connections", { replace: true });
    }
  }, [searchParams, navigate]);

  // Fetch existing connections
  useEffect(() => {
    const fetchConnections = async () => {
      if (!user) return;

      try {
        const { data: existingConnections, error } = await supabase
          .from('platform_connections')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching connections:', error);
          return;
        }

        if (existingConnections && existingConnections.length > 0) {
          setConnections(existingConnections.map(conn => ({
            id: conn.id,
            platform: conn.platform,
            name: conn.platform_username || `${conn.platform} Account`,
            status: "connected" as const,
            avatar: conn.platform_avatar_url,
            connected_at: new Date(conn.created_at),
          })));
        } else {
          setConnections([]);
        }
      } catch (err) {
        console.error("Error fetching connections:", err);
      }
    };

    if (user) {
      fetchConnections();
    } else {
      setConnections([]);
    }
  }, [user]);

  // Update the handleConnect function to correctly handle Google Drive platform
  const handleConnect = async (platform: Connection['platform']) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to connect your accounts",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);
    setConnectingPlatform(platform);

    try {
      console.log(`Initiating ${platform} OAuth flow for user ${user.id}`);
      
      // Fix: Use "google-drive" instead of "google_drive" when making the function call
      const functionName = platform === "google_drive" ? "google-drive-oauth" : `${platform}-oauth`;
      
      // Include userId in the request body as a fallback for auth issues
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { userId: user.id }
      });

      if (error) {
        console.error(`Error initiating ${platform} OAuth:`, error);
        throw new Error(`Failed to connect to ${platform}`);
      }

      console.log(`${platform} OAuth response:`, data);

      if (data && data.url) {
        // Redirect to OAuth URL
        console.log(`Redirecting to ${platform} OAuth URL:`, data.url);
        window.location.href = data.url;
      } else {
        console.error(`Invalid response from ${platform} OAuth service:`, data);
        throw new Error(`Invalid response from ${platform} OAuth service`);
      }
    } catch (error) {
      console.error(`Error initiating ${platform} OAuth:`, error);
      toast({
        title: "Connection failed",
        description: `Failed to connect to ${platform}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (connectionId: string, platform: Platform) => {
    if (!user) return;
    
    try {
      // Delete the connection from Supabase
      const { error } = await supabase
        .from('platform_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state - remove the disconnected platform
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      // Show success toast
      toast({
        title: "Disconnected successfully",
        description: `Your ${platform} account has been disconnected.`,
      });
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast({
        title: "Disconnection failed",
        description: `Failed to disconnect your ${platform} account. Please try again.`,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Check if adding another account is allowed based on subscription
  const canAddAnotherAccount = (platform: Platform) => {
    if (!subscription || !subscription.platform_limits) return false;
    
    const connectedAccountsCount = connections.filter(conn => conn.platform === platform).length;
    const platformLimit = subscription.platform_limits.platforms || 1;
    
    return connectedAccountsCount < platformLimit;
  };

  // Get all connections for a specific platform
  const getConnectionsByPlatform = (platform: Connection['platform']): Connection[] => {
    return connections.filter(c => c.platform === platform) || [];
  };
  
  // Check if a platform has any connections
  const hasPlatformConnections = (platform: Connection['platform']): boolean => {
    return connections.some(c => c.platform === platform);
  };

  // Create empty connections for platforms without connections
  const getEmptyConnectionForPlatform = (platform: Connection['platform']): Partial<Connection> => {
    return emptyConnections.find(c => c.platform === platform) || 
      { platform, status: "disconnected" };
  };

  if (authLoading || subscriptionLoading) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Platform Connections</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to enable content repurposing
        </p>
      </div>
      
      {!user && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to connect your accounts. Please sign in first.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* TikTok Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("tiktok").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "tiktok"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("tiktok") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("tiktok")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "tiktok"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("tiktok") && canAddAnotherAccount("tiktok") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("tiktok")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another TikTok account
            </Button>
          )}
        </div>
        
        {/* YouTube Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("youtube").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "youtube"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("youtube") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("youtube")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "youtube"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("youtube") && canAddAnotherAccount("youtube") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("youtube")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another YouTube account
            </Button>
          )}
        </div>
        
        {/* Instagram Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("instagram").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "instagram"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("instagram") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("instagram")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "instagram"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("instagram") && canAddAnotherAccount("instagram") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("instagram")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another Instagram account
            </Button>
          )}
        </div>
        
        {/* Facebook Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("facebook").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "facebook"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("facebook") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("facebook")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "facebook"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("facebook") && canAddAnotherAccount("facebook") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("facebook")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another Facebook account
            </Button>
          )}
        </div>
        
        {/* Google Drive Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("google_drive").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "google_drive"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("google_drive") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("google_drive")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "google_drive"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("google_drive") && canAddAnotherAccount("google_drive") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("google_drive")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another Google Drive account
            </Button>
          )}
        </div>
        
        {/* Dropbox Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("dropbox").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "dropbox"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("dropbox") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("dropbox")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "dropbox"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("dropbox") && canAddAnotherAccount("dropbox") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("dropbox")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another Dropbox account
            </Button>
          )}
        </div>
        
        {/* Pinterest Section */}
        <div className="space-y-4">
          {getConnectionsByPlatform("pinterest").map((connection) => (
            <ConnectionCard 
              key={connection.id}
              connection={connection}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "pinterest"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          ))}
          
          {!hasPlatformConnections("pinterest") && (
            <ConnectionCard 
              connection={getEmptyConnectionForPlatform("pinterest")}
              onConnect={handleConnect}
              isConnecting={connecting && connectingPlatform === "pinterest"}
              disabled={!user}
              onDisconnect={handleDisconnect}
            />
          )}
          
          {hasPlatformConnections("pinterest") && canAddAnotherAccount("pinterest") && (
            <Button 
              variant="outline" 
              className="w-full py-6 border-dashed" 
              onClick={() => handleConnect("pinterest")}
              disabled={connecting || !user}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add another Pinterest account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
