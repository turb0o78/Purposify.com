
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

type WorkflowType = "future" | "existing";

interface WorkflowTypeSelectorProps {
  value: WorkflowType;
  onChange: (value: WorkflowType) => void;
}

export default function WorkflowTypeSelector({ value, onChange }: WorkflowTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card 
        className={`cursor-pointer transition-all hover:border-primary ${
          value === "future" ? "border-2 border-primary" : ""
        }`}
        onClick={() => onChange("future")}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Repurpose Future Content</CardTitle>
            {value === "future" && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Automatically repurpose new content as it's uploaded to your source platform.
          </p>
        </CardContent>
      </Card>

      <Card 
        className={`cursor-pointer transition-all hover:border-primary ${
          value === "existing" ? "border-2 border-primary" : ""
        }`}
        onClick={() => onChange("existing")}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Repurpose Existing Content</CardTitle>
            {value === "existing" && (
              <Check className="h-5 w-5 text-primary" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select and repurpose content that's already on your source platform.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
