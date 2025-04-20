
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import WorkflowTypeSelector from "@/components/WorkflowTypeSelector";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Connection, Platform } from "@/types";

export default function NewWorkflow() {
  const [step, setStep] = useState(1);
  const [workflowType, setWorkflowType] = useState<"future" | "existing">("future");
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const fetchConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_connections')
        .select('*')
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      if (data) {
        setConnections(data.map(conn => ({
          id: conn.id,
          platform: conn.platform,
          name: conn.platform_username || `${conn.platform} Account`,
          status: 'connected',
          connected_at: new Date(conn.created_at),
          avatar: conn.platform_avatar_url
        })));
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      toast({
        title: "Error",
        description: "Failed to load your connected accounts. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleCreateWorkflow = async (workflowData: {
    name: string;
    sourcePlatform: Platform;
    targetPlatform: Platform;
    sourceAccount: string;
    targetAccount: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('workflows')
        .insert([{
          name: workflowData.name,
          workflow_type: workflowType,
          user_id: user?.id,
          source_platform: workflowData.sourcePlatform,
          target_platform: workflowData.targetPlatform,
          source_connection_id: workflowData.sourceAccount,
          target_connection_id: workflowData.targetAccount,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your workflow has been created.",
      });
      
      navigate('/workflows');
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch connections when component mounts
  useState(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux Workflows
        </Button>
        <h1 className="text-3xl font-bold">Créer un Nouveau Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Configurez l'automatisation du contenu entre vos plateformes connectées
        </p>
      </div>
      
      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez un Type de Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <WorkflowTypeSelector 
              value={workflowType} 
              onChange={setWorkflowType}
            />
            
            <div className="flex justify-end">
              <Button 
                onClick={handleContinue}
                disabled={isLoading}
              >
                Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <WorkflowBuilder 
          connections={connections}
          onSave={handleCreateWorkflow}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
