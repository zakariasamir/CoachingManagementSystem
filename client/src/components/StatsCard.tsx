import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CalendarCheck, Target } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: "sessions" | "goals" | "payments";
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case "sessions":
        return <CalendarCheck className="h-10 w-10 text-primary" />;
      case "goals":
        return <Target className="h-10 w-10 text-primary" />;
      case "payments":
        return <DollarSign className="h-10 w-10 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <Card className="flex items-center p-6 gap-4 shadow-sm hover:shadow-md transition">
      <div className="bg-primary/10 rounded-full p-3">
        {renderIcon()}
      </div>
      <CardContent className="flex flex-col justify-center p-0">
        <p className="text-muted-foreground text-sm">{title}</p>
        <h3 className="font-bold text-2xl text-center">{value}</h3>
      </CardContent>
    </Card>
  );
}
