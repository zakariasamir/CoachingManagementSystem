import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, CalendarCheck, Target, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: "sessions" | "goals" | "payments" | "check";
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const getCardStyles = () => {
    switch (icon) {
      case "sessions":
        return "from-blue-600 to-blue-700";
      case "goals":
        return "from-green-600 to-green-700";
      case "payments":
        return "from-purple-600 to-purple-700";
      default:
        return "from-blue-600 to-blue-700";
    }
  };

  const renderIcon = () => {
    switch (icon) {
      case "sessions":
        return <CalendarCheck className="h-10 w-10 text-blue-100" />;
      case "goals":
        return <Target className="h-10 w-10 text-green-100" />;
      case "payments":
        return <DollarSign className="h-10 w-10 text-purple-100" />;
      case "check":
        return <Check className="h-10 w-10 text-green-100" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={cn(
        "flex items-center bg-gradient-to-br p-6 gap-4 hover:shadow-md transition shadow-lg",
        getCardStyles()
      )}
    >
      <div className="bg-white/10 rounded-full p-3">{renderIcon()}</div>
      <CardContent className="flex flex-col justify-center p-0">
        <p className="text-white/70 text-sm">{title}</p>
        <h3 className="font-bold text-2xl text-center text-white">{value}</h3>
      </CardContent>
    </Card>
  );
}
