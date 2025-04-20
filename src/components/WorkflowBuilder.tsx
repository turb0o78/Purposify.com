import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Connection, Platform } from "@/types";
import { ArrowRight, Plus, Trash2 } from "lucide-react";

interface WorkflowBuilderProps {
  connections: Connection[];
  onSave: (workflow: any) => void;
  isLoading?: boolean;
}

// Custom Step component since shadcn/ui doesn't provide one out of the box
const Step = ({ 
  children, 
  isActive, 
  isComplete, 
  number, 
  title, 
  description 
}: { 
  children: React.ReactNode;
  isActive: boolean;
  isComplete: boolean;
  number: number;
  title: string;
  description?: string;
}) => {
  return (
    <div className={`relative ${isActive ? 'opacity-100' : 'opacity-70'}`}>
      <div className="flex items-start mb-2">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
          isComplete ? 'bg-green-100 text-green-800' : 
          isActive ? 'bg-brand-purple text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {number}
        </div>
        <div>
          <h4 className="text-lg font-medium">{title}</h4>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <div className="ml-4 pl-4 border-l border-gray-200">
        {children}
      </div>
    </div>
  );
};

const StepSeparator = () => {
  return <div className="h-6"></div>;
};

const WorkflowBuilder = ({ connections, onSave, isLoading = false }: WorkflowBuilderProps) => {
  const [activeStep, setActiveStep] = useState(1);
  const [workflowName, setWorkflowName] = useState("");
  const [sourcePlatform, setSourcePlatform] = useState<Platform | "">("");
  const [targetPlatform, setTargetPlatform] = useState<Platform | "">("");
  const [sourceAccount, setSourceAccount] = useState("");
  const [targetAccount, setTargetAccount] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [rules, setRules] = useState<Array<{type: string; operator: string; value: string}>>([]);

  const tiktokConnections = connections.filter(c => c.platform === "tiktok" && c.status === "connected");
  const youtubeConnections = connections.filter(c => c.platform === "youtube" && c.status === "connected");

  const handleContinue = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      const workflow = {
        name: workflowName,
        sourcePlatform,
        targetPlatform,
        sourceAccount,
        targetAccount,
        isActive,
        rules,
      };
      onSave(workflow);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const addRule = () => {
    setRules([...rules, { type: "hashtag", operator: "contains", value: "" }]);
  };

  const removeRule = (index: number) => {
    const newRules = [...rules];
    newRules.splice(index, 1);
    setRules(newRules);
  };

  const updateRule = (index: number, field: string, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return workflowName.trim() !== "" && sourcePlatform !== "" && targetPlatform !== "";
      case 2:
        return sourceAccount !== "" && targetAccount !== "";
      case 3:
        return true; // Rules are optional
      default:
        return false;
    }
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle>Create New Workflow</CardTitle>
        <CardDescription>
          Set up an automated workflow to repurpose content between platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Step 
            isActive={activeStep === 1} 
            isComplete={activeStep > 1}
            number={1}
            title="Workflow Details"
            description="Name your workflow and select platforms"
          >
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Workflow Name</label>
                <Input
                  placeholder="e.g., TikTok to YouTube Shorts"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="max-w-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium mb-1">Source Platform</label>
                  <Select 
                    value={sourcePlatform} 
                    onValueChange={(value) => {
                      setSourcePlatform(value as Platform);
                      if (targetPlatform === value) {
                        setTargetPlatform("");
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tiktok">
                        <div className="flex items-center">
                          <div className="bg-black text-white p-1 rounded mr-2">
                            <svg viewBox="0 0 24 24" className="h-4 w-4">
                              <path
                                fill="currentColor"
                                d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                              />
                            </svg>
                          </div>
                          TikTok
                        </div>
                      </SelectItem>
                      <SelectItem value="youtube">
                        <div className="flex items-center">
                          <div className="bg-red-600 text-white p-1 rounded mr-2">
                            <svg viewBox="0 0 24 24" className="h-4 w-4">
                              <path
                                fill="currentColor"
                                d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                              />
                            </svg>
                          </div>
                          YouTube
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-center">
                  <div className="flex items-center">
                    <ArrowRight className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Target Platform</label>
                  <Select 
                    value={targetPlatform} 
                    onValueChange={(value) => setTargetPlatform(value as Platform)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourcePlatform !== "tiktok" && (
                        <SelectItem value="tiktok">
                          <div className="flex items-center">
                            <div className="bg-black text-white p-1 rounded mr-2">
                              <svg viewBox="0 0 24 24" className="h-4 w-4">
                                <path
                                  fill="currentColor"
                                  d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"
                                />
                              </svg>
                            </div>
                            TikTok
                          </div>
                        </SelectItem>
                      )}
                      {sourcePlatform !== "youtube" && (
                        <SelectItem value="youtube">
                          <div className="flex items-center">
                            <div className="bg-red-600 text-white p-1 rounded mr-2">
                              <svg viewBox="0 0 24 24" className="h-4 w-4">
                                <path
                                  fill="currentColor"
                                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .5 6.186C0 8.07 0 12 0 12s0 3.93.5 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                                />
                              </svg>
                            </div>
                            YouTube
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Step>

          <StepSeparator />

          <Step 
            isActive={activeStep === 2} 
            isComplete={activeStep > 2}
            number={2}
            title="Account Selection"
            description="Choose which accounts to use for this workflow"
          >
            <div className={`space-y-4 py-4 ${activeStep !== 2 ? 'opacity-50' : ''}`}>
              <div>
                <label className="block text-sm font-medium mb-1">Source Account</label>
                <Select 
                  value={sourceAccount} 
                  onValueChange={setSourceAccount}
                  disabled={activeStep !== 2}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourcePlatform === "tiktok" ? (
                      tiktokConnections.length > 0 ? (
                        tiktokConnections.map(connection => (
                          <SelectItem key={connection.id} value={connection.id}>
                            {connection.name || "TikTok Account"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No TikTok accounts connected
                        </SelectItem>
                      )
                    ) : sourcePlatform === "youtube" ? (
                      youtubeConnections.length > 0 ? (
                        youtubeConnections.map(connection => (
                          <SelectItem key={connection.id} value={connection.id}>
                            {connection.name || "YouTube Account"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No YouTube accounts connected
                        </SelectItem>
                      )
                    ) : (
                      <SelectItem value="" disabled>
                        Select a source platform first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Account</label>
                <Select 
                  value={targetAccount} 
                  onValueChange={setTargetAccount}
                  disabled={activeStep !== 2}
                >
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetPlatform === "tiktok" ? (
                      tiktokConnections.length > 0 ? (
                        tiktokConnections.map(connection => (
                          <SelectItem key={connection.id} value={connection.id}>
                            {connection.name || "TikTok Account"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No TikTok accounts connected
                        </SelectItem>
                      )
                    ) : targetPlatform === "youtube" ? (
                      youtubeConnections.length > 0 ? (
                        youtubeConnections.map(connection => (
                          <SelectItem key={connection.id} value={connection.id}>
                            {connection.name || "YouTube Account"}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          No YouTube accounts connected
                        </SelectItem>
                      )
                    ) : (
                      <SelectItem value="" disabled>
                        Select a target platform first
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Step>

          <StepSeparator />

          <Step 
            isActive={activeStep === 3} 
            isComplete={false}
            number={3}
            title="Rules & Settings"
            description="Set conditions for which content to repurpose"
          >
            <div className={`space-y-4 py-4 ${activeStep !== 3 ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h5 className="font-medium">Workflow Status</h5>
                  <p className="text-sm text-gray-500">Enable or disable this workflow</p>
                </div>
                <Switch 
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={activeStep !== 3}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium">Filter Rules (Optional)</h5>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addRule} 
                    disabled={activeStep !== 3}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Rule
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {rules.length === 0 ? (
                    <div className="text-sm text-gray-500 p-4 border border-dashed border-gray-300 rounded-md">
                      No rules added. Content will be repurposed without filtering.
                    </div>
                  ) : (
                    rules.map((rule, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-md">
                        <Select
                          value={rule.type}
                          onValueChange={(value) => updateRule(index, "type", value)}
                          disabled={activeStep !== 3}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hashtag">Hashtag</SelectItem>
                            <SelectItem value="caption">Caption</SelectItem>
                            <SelectItem value="duration">Duration</SelectItem>
                            <SelectItem value="view_count">View Count</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={rule.operator}
                          onValueChange={(value) => updateRule(index, "operator", value)}
                          disabled={activeStep !== 3}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(rule.type === "hashtag" || rule.type === "caption") ? (
                              <>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="not_contains">Doesn't Contain</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                                <SelectItem value="equals">Equals</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                        
                        <Input
                          value={rule.value}
                          onChange={(e) => updateRule(index, "value", e.target.value)}
                          placeholder={rule.type === "hashtag" ? "#trending" : 
                                      rule.type === "duration" ? "60 (seconds)" :
                                      rule.type === "view_count" ? "1000" : "text"}
                          className="flex-1"
                          disabled={activeStep !== 3}
                        />
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRule(index)}
                          disabled={activeStep !== 3}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Step>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={activeStep === 1}
        >
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={!isStepValid(activeStep) || isLoading}
        >
          {activeStep === 3 ? (isLoading ? "Creating..." : "Create Workflow") : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkflowBuilder;
