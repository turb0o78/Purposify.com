
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number | string;
  className?: string;
}

const StatCard = ({ title, value, className = "" }: StatCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="mt-1">
            <span className="text-3xl font-bold">{value}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
