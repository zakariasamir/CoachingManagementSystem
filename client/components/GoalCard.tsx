import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { GoalDrawer } from "./GoalDrawer";

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
      updatedBy?: string;
      content?: string;
      timestamp?: string;
    }>;
    createdAt: string;
    __v: number;
  };
  onProgressUpdate?: (progress: number) => Promise<void>;
}

export function GoalCard({ goal, onProgressUpdate }: GoalCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsDrawerOpen(true)}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold truncate">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">
                {goal.entrepreneurId.firstName} {goal.entrepreneurId.lastName}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">
                {goal.progress}% Complete
              </p>
            </div>
          </div>
          {/* <UpdateGoalDialog goal={goal} onProgressUpdate={handleGoalUpdate} /> */}
        </CardContent>
      </Card>

      <GoalDrawer
        goal={goal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
