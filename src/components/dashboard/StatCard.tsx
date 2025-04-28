
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  className?: string;
}

const StatCard = ({ title, value, icon, className = "" }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-1">
              <span className="text-3xl font-bold">{value}</span>
            </div>
          </div>
          {icon && (
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
