
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Connection, Platform } from "@/types";
import { ArrowRight } from "lucide-react";
import { InstagramIcon, FacebookIcon, TiktokIcon, YoutubeIcon } from "./icons";

interface WorkflowBuilderProps {
  connections: Connection[];
  onSave: (workflow: any) => void;
  isLoading?: boolean;
}

export default function WorkflowBuilder({ connections, onSave, isLoading = false }: WorkflowBuilderProps) {
  const [workflowName, setWorkflowName] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<Platform | "">("");
  const [targetPlatform, setTargetPlatform] = useState<Platform | "">("");
  const [sourceAccount, setSourceAccount] = useState("");
  const [targetAccount, setTargetAccount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: workflowName,
      sourcePlatform,
      targetPlatform,
      sourceAccount,
      targetAccount,
    });
  };

  // Filter connections by platform
  const sourceConnections = connections.filter(c => c.platform === sourcePlatform);
  const targetConnections = connections.filter(c => c.platform === targetPlatform);
  
  // Get available platforms from connections
  // For now, we'll only show TikTok and YouTube as they're the only ones fully implemented
  const availablePlatforms = [...new Set(connections.map(c => c.platform))].filter(
    platform => platform === "tiktok" || platform === "youtube"
  );

  // Helper function to get platform icon
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "tiktok":
        return <span className="flex items-center"><TiktokIcon /> <span className="ml-2">TikTok</span></span>;
      case "youtube":
        return <span className="flex items-center"><YoutubeIcon /> <span className="ml-2">YouTube</span></span>;
      case "instagram":
        return <span className="flex items-center"><InstagramIcon /> <span className="ml-2">Instagram</span></span>;
      case "facebook":
        return <span className="flex items-center"><FacebookIcon /> <span className="ml-2">Facebook</span></span>;
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration du Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="workflow-name">Nom du Workflow</Label>
            <Input
              id="workflow-name"
              placeholder="Ex: TikTok vers YouTube Shorts"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="max-w-md"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <Label>Plateforme Source</Label>
              <Select 
                value={sourcePlatform} 
                onValueChange={(value) => {
                  setSourcePlatform(value as Platform);
                  setSourceAccount("");
                  if (targetPlatform === value) {
                    setTargetPlatform("");
                    setTargetAccount("");
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {getPlatformIcon(platform)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-center">
              <ArrowRight className="h-6 w-6 text-gray-400" />
            </div>
            
            <div>
              <Label>Plateforme Destination</Label>
              <Select 
                value={targetPlatform} 
                onValueChange={(value) => {
                  setTargetPlatform(value as Platform);
                  setTargetAccount("");
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une plateforme" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlatforms
                    .filter(p => p !== sourcePlatform)
                    .map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {getPlatformIcon(platform)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sourcePlatform && targetPlatform && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label>Compte Source</Label>
                <Select 
                  value={sourceAccount} 
                  onValueChange={setSourceAccount}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceConnections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        {connection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Compte Destination</Label>
                <Select 
                  value={targetAccount} 
                  onValueChange={setTargetAccount}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetConnections.map((connection) => (
                      <SelectItem key={connection.id} value={connection.id}>
                        {connection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={
            isLoading || 
            !workflowName || 
            !sourcePlatform || 
            !targetPlatform || 
            !sourceAccount || 
            !targetAccount
          }
        >
          {isLoading ? "Création..." : "Créer le Workflow"}
        </Button>
      </div>
    </form>
  );
}
