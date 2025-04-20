
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkflowBuilder from "@/components/WorkflowBuilder";
import { Button } from "@/components/ui/button";
import { Connection } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

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

const NewWorkflow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [connections] = useState<Connection[]>(mockConnections);
  const navigate = useNavigate();
  
  const handleSave = (workflow: any) => {
    setIsLoading(true);
    
    // Simulate saving to API
    setTimeout(() => {
      console.log("Saving workflow:", workflow);
      setIsLoading(false);
      
      toast({
        title: "Workflow created successfully",
        description: "Your new content repurposing workflow is now active.",
      });
      
      navigate("/workflows");
    }, 1500);
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
      
      <WorkflowBuilder 
        connections={connections} 
        onSave={handleSave}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NewWorkflow;
