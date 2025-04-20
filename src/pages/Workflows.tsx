
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Workflow, Connection } from "@/types";
import { ArrowRight, ArrowUpDown, Plus } from "lucide-react";

// Mock data for the workflows
const mockWorkflows: Workflow[] = [
  {
    id: "workflow-1",
    name: "TikTok to YouTube Shorts",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceAccount: "tiktok-1",
    targetAccount: "youtube-1",
    isActive: true,
    rules: [
      {
        id: "rule-1",
        type: "hashtag",
        operator: "contains",
        value: "#viral",
      }
    ],
    createdAt: new Date(Date.now() - 864000000), // 10 days ago
  },
  {
    id: "workflow-2",
    name: "YouTube to TikTok",
    sourcePlatform: "youtube",
    targetPlatform: "tiktok",
    sourceAccount: "youtube-1",
    targetAccount: "tiktok-1",
    isActive: true,
    rules: [
      {
        id: "rule-1",
        type: "duration",
        operator: "less_than",
        value: "60",
      }
    ],
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
  },
  {
    id: "workflow-3",
    name: "TikTok Long Videos",
    sourcePlatform: "tiktok",
    targetPlatform: "youtube",
    sourceAccount: "tiktok-1",
    targetAccount: "youtube-1",
    isActive: false,
    rules: [
      {
        id: "rule-1",
        type: "duration",
        operator: "greater_than",
        value: "45",
      },
      {
        id: "rule-2",
        type: "view_count",
        operator: "greater_than",
        value: "1000",
      }
    ],
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
  },
];

// Mock data for the connections
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

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>(mockWorkflows);
  const [connections] = useState<Connection[]>(mockConnections);
  
  const getConnectionName = (id: string) => {
    const connection = connections.find(c => c.id === id);
    return connection?.name || "Unknown Account";
  };
  
  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === id ? { ...workflow, isActive: !workflow.isActive } : workflow
    ));
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Workflows</h1>
          <p className="text-muted-foreground">
            Set up automated content repurposing between platforms
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button asChild>
            <Link to="/workflows/new">
              <Plus className="h-4 w-4 mr-1" />
              New Workflow
            </Link>
          </Button>
        </div>
      </div>
      
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-2">No workflows found</h3>
            <p className="text-muted-foreground mb-6 text-center">
              Create your first workflow to start automatically repurposing content
            </p>
            <Button asChild>
              <Link to="/workflows/new">
                <Plus className="h-4 w-4 mr-1" />
                Create Workflow
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${workflow.sourcePlatform === "tiktok" ? "platform-tiktok" : "platform-youtube"}`}>
                    {workflow.sourcePlatform === "tiktok" ? (
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
                    <h3 className="text-lg font-semibold">{workflow.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                      <span className="mr-1">{getConnectionName(workflow.sourceAccount)}</span>
                      <ArrowRight className="mx-1 h-3 w-3" />
                      <span>{getConnectionName(workflow.targetAccount)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant={workflow.isActive ? "default" : "outline"} className={workflow.isActive ? "bg-green-100 text-green-800 border-green-200" : ""}>
                    {workflow.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Switch 
                    checked={workflow.isActive}
                    onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                  />
                </div>
              </div>
              
              <CardContent className="p-0">
                <div className="p-6 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Rules</h4>
                    <p className="text-sm text-muted-foreground">
                      Created {workflow.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  
                  {workflow.rules.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No rules configured. All content will be repurposed.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {workflow.rules.map(rule => (
                        <div key={rule.id} className="bg-white p-3 rounded-md border flex items-center text-sm">
                          <Badge variant="outline" className="mr-2">
                            {rule.type === "hashtag" ? "Hashtag" : 
                             rule.type === "caption" ? "Caption" :
                             rule.type === "duration" ? "Duration" :
                             "View Count"}
                          </Badge>
                          <span className="mr-2">
                            {rule.operator === "contains" ? "contains" :
                             rule.operator === "not_contains" ? "doesn't contain" :
                             rule.operator === "equals" ? "equals" :
                             rule.operator === "not_equals" ? "doesn't equal" :
                             rule.operator === "greater_than" ? "is greater than" :
                             "is less than"}
                          </span>
                          <Badge className="bg-gray-100 text-gray-800 font-mono">
                            {rule.value}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex justify-end gap-3 border-t">
                  <Button variant="outline">Edit Workflow</Button>
                  <Button variant="destructive" className="bg-red-500 hover:bg-red-600">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Workflows;
