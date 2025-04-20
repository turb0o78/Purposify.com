
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";
import WorkflowTypeSelector from "@/components/WorkflowTypeSelector";
import { Connection } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for connections
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

export default function NewWorkflow() {
  const [step, setStep] = useState(1);
  const [workflowType, setWorkflowType] = useState<"future" | "existing">("future");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleContinue = async () => {
    if (step === 1) {
      setStep(2);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Workflows
        </Button>
        <h1 className="text-3xl font-bold">Create New Workflow</h1>
        <p className="text-muted-foreground mt-1">
          Set up automated content repurposing between your connected platforms
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Choose a Workflow Type</CardTitle>
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
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
