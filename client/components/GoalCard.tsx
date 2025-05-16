import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface GoalCardProps {
  goal: {
    _id: string;
    title: string;
    description: string;
    progress: number;
    status: "not-started" | "in-progress" | "completed";
    entrepreneurId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    organizationId: string;
    coachId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    updates: Array<{
      updatedBy?: string; // Make optional as it's not always present
      content?: string; // Make optional as it's not always present
      timestamp?: string; // Make optional as it's not always present
    }>;
    createdAt: string;
    __v: number;
  };
  onProgressUpdate?: (progress: number) => Promise<void>;
}

export function GoalCard({ goal, onProgressUpdate }: GoalCardProps) {
  const { user } = useAuth();
  const isCoach = user?.role === "coach";
  const [progress, setProgress] = useState(goal.progress);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProgressChange = async () => {
    if (progress === goal.progress) return;
    setIsUpdating(true);
    try {
      if (onProgressUpdate) {
        await onProgressUpdate(progress);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in_progress":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusFromProgress = (progress: number) => {
    if (progress === 100) return "completed";
    if (progress > 0) return "in-progress";
    return "not-started";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-500">
          Entrepreneur: {goal.entrepreneurId.firstName}{" "}
          {goal.entrepreneurId.lastName}
        </p>
        <p
          className={`text-sm font-medium ${getStatusColor(
            getStatusFromProgress(progress)
          )}`}
        >
          Status:{" "}
          {getStatusFromProgress(progress).replace("-", " ").toUpperCase()}
        </p>
        <p className="text-sm">{goal.description}</p>

        {isCoach ? (
          <div className="space-y-2">
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{progress}% Complete</p>
              <Button
                size="sm"
                onClick={handleProgressChange}
                disabled={progress === goal.progress || isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Progress"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className="bg-primary h-2.5 rounded-full transition-all"
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <p className="text-right text-xs text-gray-500">
              {goal.progress}% Complete
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
