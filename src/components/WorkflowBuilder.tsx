
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Connection, Platform } from "@/types";
import { ArrowRight } from "lucide-react";

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
  const availablePlatforms = [...new Set(connections.map(c => c.platform))];

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
                      <div className="flex items-center">
                        {platform === 'tiktok' ? (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                            <path
                              fill="currentColor"
                              d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                            />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                            <path
                              fill="currentColor"
                              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                            />
                          </svg>
                        )}
                        {platform === 'tiktok' ? 'TikTok' : 'YouTube'}
                      </div>
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
                        <div className="flex items-center">
                          {platform === 'tiktok' ? (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                              <path
                                fill="currentColor"
                                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                              />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                              <path
                                fill="currentColor"
                                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                              />
                            </svg>
                          )}
                          {platform === 'tiktok' ? 'TikTok' : 'YouTube'}
                        </div>
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
