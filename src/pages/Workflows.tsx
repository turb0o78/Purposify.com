
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Workflow, Connection } from "@/types";
import { ArrowRight, ArrowUpDown, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchConnections = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        setConnections(data.map(conn => ({
          id: conn.id,
          platform: conn.platform,
          name: conn.platform_username || `${conn.platform} Account`,
          status: 'connected',
          connected_at: new Date(conn.created_at || ''),
          avatar: conn.platform_avatar_url
        })));
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load your connected accounts.",
        variant: "destructive"
      });
    }
  };

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        // Transform Supabase data to match our Workflow type
        const transformedWorkflows: Workflow[] = data.map(workflow => ({
          id: workflow.id,
          name: workflow.name,
          sourcePlatform: workflow.source_platform,
          targetPlatform: workflow.target_platform,
          sourceAccount: workflow.source_connection_id,
          targetAccount: workflow.target_connection_id,
          isActive: workflow.is_active || false,
          rules: [], // We'll need to add workflow rules functionality later
          createdAt: new Date(workflow.created_at || new Date())
        }));
        
        setWorkflows(transformedWorkflows);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load your workflows. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getConnectionName = (id: string) => {
    const connection = connections.find(c => c.id === id);
    return connection?.name || "Unknown Account";
  };
  
  const toggleWorkflowStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: !currentStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state to reflect the change
      setWorkflows(workflows.map(workflow => 
        workflow.id === id ? { ...workflow, isActive: !currentStatus } : workflow
      ));
      
      toast({
        title: "Success",
        description: `Workflow ${!currentStatus ? 'activated' : 'deactivated'} successfully.`
      });
    } catch (error) {
      console.error('Error updating workflow status:', error);
      toast({
        title: "Error",
        description: "Failed to update workflow status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleEditWorkflow = (id: string) => {
    // For now, just navigate to the edit page (we'll implement this later)
    navigate(`/workflows/edit/${id}`);
  };
  
  const handleDeleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove the workflow from local state
      setWorkflows(workflows.filter(workflow => workflow.id !== id));
      
      toast({
        title: "Success",
        description: "Workflow deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to delete workflow. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchWorkflows();
    }
  }, [user]);
  
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
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : workflows.length === 0 ? (
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
                  <div className={`p-2 rounded-lg ${workflow.sourcePlatform === "tiktok" ? "bg-black" : "bg-red-600"}`}>
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
                    onCheckedChange={() => toggleWorkflowStatus(workflow.id, workflow.isActive)}
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
                  <Button 
                    variant="outline"
                    onClick={() => handleEditWorkflow(workflow.id)}
                  >
                    Edit Workflow
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="bg-red-500 hover:bg-red-600"
                    onClick={() => handleDeleteWorkflow(workflow.id)}
                  >
                    Delete
                  </Button>
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
