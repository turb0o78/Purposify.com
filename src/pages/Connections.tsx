import { useState, useEffect } from "react";
import { Connection, Platform } from "@/types";
import { Button } from "@/components/ui/button";
import ConnectionCard from "@/components/ConnectionCard";
import { toast } from "@/components/ui/use-toast";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
];

const Connections = () => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const navigate = useNavigate();

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
      // Include userId in the request body as a fallback for auth issues
      const { data, error } = await supabase.functions.invoke(`${platform}-oauth`, {
        method: 'POST',
        body: { userId: user.id }
      });

      if (error) {
        console.error(`Error initiating ${platform} OAuth:`, error);
        throw new Error(`Failed to connect to ${platform}`);
      }

      if (data && data.url) {
        // Redirect to OAuth URL
        window.location.href = data.url;
      } else {
        throw new Error(`Invalid response from ${platform} OAuth service`);
      }
    } catch (error) {
      console.error(`Error initiating ${platform} OAuth:`, error);
      toast({
        title: "Connection failed",
        description: `Failed to connect to ${platform}. Please try again.`,
        variant: "destructive",
      });
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

  const getConnectionByPlatform = (platform: Connection['platform']): Partial<Connection> => {
    const existingConnection = connections.find(c => c.platform === platform);
    if (existingConnection) {
      return existingConnection;
    }
    
    return emptyConnections.find(c => c.platform === platform) || { platform, status: "disconnected" };
  };

  if (authLoading) {
    return (
      <div className="container mx-auto py-6">
        <p className="text-center">Loading authentication status...</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ConnectionCard 
          connection={getConnectionByPlatform("tiktok")}
          onConnect={handleConnect}
          isConnecting={connecting && connectingPlatform === "tiktok"}
          disabled={!user}
          onDisconnect={handleDisconnect}
        />
        
        <ConnectionCard 
          connection={getConnectionByPlatform("youtube")}
          onConnect={handleConnect}
          isConnecting={connecting && connectingPlatform === "youtube"}
          disabled={!user}
          onDisconnect={handleDisconnect}
        />
      </div>
    </div>
  );
};

export default Connections;
