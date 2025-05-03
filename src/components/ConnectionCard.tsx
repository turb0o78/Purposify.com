
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Connection } from "@/types";
import { 
  InstagramIcon, 
  FacebookIcon, 
  TiktokIcon, 
  YoutubeIcon, 
  GoogleDriveIcon,
  DropboxIcon,
  PinterestIcon
} from "@/components/icons";
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
  
  const getPlatformIcon = (platform: Connection['platform']) => {
    switch (platform) {
      case "tiktok":
        return <TiktokIcon />;
      case "youtube":
        return <YoutubeIcon />;
      case "instagram":
        return <InstagramIcon />;
      case "facebook":
        return <FacebookIcon />;
      case "google_drive":
        return <GoogleDriveIcon />;
      case "dropbox":
        return <DropboxIcon />;
      case "pinterest":
        return <PinterestIcon />;
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
      case "instagram":
        return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "facebook":
        return "bg-blue-600";
      case "google_drive":
        return "bg-green-500";
      case "dropbox":
        return "bg-blue-400";
      case "pinterest":
        return "bg-red-600";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const getPlatformName = (platform: Connection['platform']) => {
    switch (platform) {
      case "tiktok":
        return "TikTok";
      case "youtube":
        return "YouTube";
      case "instagram":
        return "Instagram";
      case "facebook":
        return "Facebook";
      case "google_drive":
        return "Google Drive";
      case "dropbox":
        return "Dropbox";
      case "pinterest":
        return "Pinterest";
      default:
        return platform;
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
              {getPlatformIcon(connection.platform)}
            </div>
            <div>
              <CardTitle className="text-xl">{getPlatformName(connection.platform)}</CardTitle>
              <CardDescription>
                {connection.status === "connected" ? 
                  `Connected as ${connection.name || "User"}` : 
                  `Connect your ${getPlatformName(connection.platform)} account`}
              </CardDescription>
            </div>
          </div>
          {connection.status && getStatusBadge(connection.status)}
        </div>
      </CardHeader>
      <CardContent>
        {connection.status === "connected" ? (
          <div className="text-sm text-gray-500">
            <p>Last synced: {connection.connected_at ? new Date(connection.connected_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {connection.platform === "tiktok" 
              ? "Access your TikTok videos for repurposing to other platforms." 
              : connection.platform === "youtube"
              ? "Publish your repurposed content directly to your YouTube channel."
              : connection.platform === "instagram"
              ? "Share your content on Instagram without watermarks."
              : connection.platform === "facebook"
              ? "Publish your videos directly to your Facebook page."
              : connection.platform === "google_drive"
              ? "Store and access your videos from Google Drive."
              : connection.platform === "dropbox"
              ? "Sync your content with your Dropbox account."
              : connection.platform === "pinterest"
              ? "Share your content as pins on Pinterest."
              : "Connect to access your content and publish to this platform."}
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
            className={`w-full ${getPlatformClassName(connection.platform)}`}
            onClick={() => onConnect(connection.platform)}
            disabled={isConnecting || disabled}
          >
            {isConnecting ? "Connecting..." : `Connect to ${getPlatformName(connection.platform)}`}
            {disabled && " (Login required)"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ConnectionCard;
