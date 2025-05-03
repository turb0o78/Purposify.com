
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  className?: string;
  trend?: number;
  trendLabel?: string;
  trendDirection?: "up" | "down" | "neutral";
}

const StatCard = ({ title, value, icon, className = "", trend, trendLabel, trendDirection = "up" }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-1">
              <span className="text-3xl font-bold">{value}</span>
            </div>
            
            {trend !== undefined && trendLabel && (
              <div className="flex items-center mt-2 text-xs">
                <span className={`flex items-center ${
                  trendDirection === "up" ? "text-green-600" : 
                  trendDirection === "down" ? "text-red-600" : "text-gray-500"
                }`}>
                  {trendDirection === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                  {trendDirection === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                  {trendDirection === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                  {trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : `${trend}%`}
                </span>
                <span className="text-gray-500 ml-1">{trendLabel}</span>
              </div>
            )}
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
