import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoalCardProps {
  goal: {
    id: number;
    entrepreneur: string;
    title: string;
    progress: number;
  };
}

export function GoalCard({ goal }: GoalCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-gray-500">Entrepreneur: {goal.entrepreneur}</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full"
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
        <p className="text-right text-xs">{goal.progress}% Complete</p>
      </CardContent>
    </Card>
  );
}
