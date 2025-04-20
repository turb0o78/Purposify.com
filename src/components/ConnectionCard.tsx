
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Connection } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ConnectionCardProps {
  connection: Partial<Connection>;
  onConnect: (platform: Connection['platform']) => void;
  isConnecting: boolean;
  disabled?: boolean;
  onDisconnect?: (id: string, platform: Connection['platform']) => void;
}

const ConnectionCard = ({ 
  connection, 
  onConnect, 
  isConnecting, 
  disabled = false,
  onDisconnect
}: ConnectionCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  
  const getPlatformLogo = (platform: Connection['platform']) => {
    switch (platform) {
      case "tiktok":
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              fill="currentColor"
              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
            />
          </svg>
        );
      case "youtube":
        return (
          <svg viewBox="0 0 24 24" className="w-6 h-6">
            <path
              fill="currentColor"
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPlatformClassName = (platform: Connection['platform']) => {
    switch (platform) {
      case "tiktok":
        return "platform-tiktok";
      case "youtube":
        return "platform-youtube";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getStatusBadge = (status: Connection['status']) => {
    switch (status) {
      case "connected":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Connected</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Connecting...</Badge>;
      case "disconnected":
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">Not Connected</Badge>;
    }
  };

  const handleDisconnect = async () => {
    if (!connection.id || !connection.platform || !onDisconnect) return;
    
    try {
      setDisconnecting(true);
      await onDisconnect(connection.id, connection.platform);
    } catch (error) {
      toast({
        title: "Error disconnecting",
        description: "There was a problem disconnecting your account.",
        variant: "destructive",
      });
      console.error("Error disconnecting:", error);
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <Card 
      className={`card-hover ${isHovering ? 'border-brand-purple/50' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${getPlatformClassName(connection.platform)}`}>
              {getPlatformLogo(connection.platform)}
            </div>
            <div>
              <CardTitle className="text-xl">{connection.platform === "tiktok" ? "TikTok" : "YouTube"}</CardTitle>
              <CardDescription>
                {connection.status === "connected" ? 
                  `Connected as ${connection.name || "User"}` : 
                  `Connect your ${connection.platform === "tiktok" ? "TikTok" : "YouTube"} account`}
              </CardDescription>
            </div>
          </div>
          {connection.status && getStatusBadge(connection.status)}
        </div>
      </CardHeader>
      <CardContent>
        {connection.status === "connected" ? (
          <div className="text-sm text-gray-500">
            <p>Last synced: {new Date().toLocaleDateString()}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {connection.platform === "tiktok" 
              ? "Access your TikTok videos for repurposing to other platforms." 
              : "Publish your repurposed content directly to your YouTube channel."}
          </p>
        )}
      </CardContent>
      <CardFooter>
        {connection.status === "connected" ? (
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1">
              Refresh
            </Button>
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={handleDisconnect}
              disabled={disconnecting}
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        ) : (
          <Button 
            className={`w-full ${connection.platform === "tiktok" ? "platform-tiktok" : "platform-youtube"}`}
            onClick={() => onConnect(connection.platform)}
            disabled={isConnecting || disabled}
          >
            {isConnecting ? "Connecting..." : `Connect to ${connection.platform === "tiktok" ? "TikTok" : "YouTube"}`}
            {disabled && " (Login required)"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConnectionCard;
