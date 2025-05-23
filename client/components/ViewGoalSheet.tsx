import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  entrepreneurId: {
    firstName: string;
    lastName: string;
  };
  coachId: {
    firstName: string;
    lastName: string;
  };
  updates?: Array<{
    content?: string;
    timestamp?: string;
  }>;
  createdAt: string;
}

interface ViewGoalSheetProps {
  goal: Goal;
  trigger?: React.ReactNode;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, "MMM d, yyyy");
  } catch (error) {
    return "";
  }
};

export function ViewGoalSheet({ goal, trigger }: ViewGoalSheetProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "in-progress":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full">
            View Goal
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{goal.title}</SheetTitle>
          {/* <SheetDescription>
            Goal for {goal.entrepreneurId.firstName}{" "}
            {goal.entrepreneurId.lastName}
          </SheetDescription> */}
        </SheetHeader>

        <div className="mt-8 space-y-6 p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {/* Status and Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span
                className={`text-sm font-medium ${getStatusColor(goal.status)}`}
              >
                {goal.status.charAt(0).toUpperCase() +
                  goal.status.slice(1).replace("-", " ")}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Description</h3>
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          </div>

          {/* Coach Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Assigned Coach</h3>
            <p className="text-sm text-muted-foreground">
              {goal.coachId.firstName} {goal.coachId.lastName}
            </p>
          </div>

          {/* Updates Section */}
          {goal.updates && goal.updates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Progress Updates</h3>
              <div className="space-y-4">
                {goal.updates
                  .slice()
                  .reverse()
                  .map((update, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <p className="text-sm">{update.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(update.timestamp)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Created on {formatDate(goal.createdAt)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
