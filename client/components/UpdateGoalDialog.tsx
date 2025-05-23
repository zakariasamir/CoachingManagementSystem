import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
  updates?: Array<{
    content?: string;
    timestamp?: string;
  }>;
  createdAt: string;
}

interface GoalSheetProps {
  goal: Goal;
  onProgressUpdate: (
    goalId: string,
    progress: number,
    note: string
  ) => Promise<void>;
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

function UpdateProgressDialog({
  goal,
  onProgressUpdate,
  onOpenChange,
}: {
  goal: Goal;
  onProgressUpdate: (
    goalId: string,
    progress: number,
    note: string
  ) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}) {
  const [progress, setProgress] = useState(goal.progress);
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onProgressUpdate(goal._id, progress, note);
      onOpenChange(false);
      setNote("");
    } catch (error) {
      console.error("Error updating goal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Update Goal Progress</DialogTitle>
        <DialogDescription>
          Update progress for {goal.entrepreneurId.firstName}{" "}
          {goal.entrepreneurId.lastName}&apos;s goal
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-6 pt-4">
        <div className="space-y-4">
          <Label>Progress ({progress}%)</Label>
          <Slider
            value={[progress]}
            onValueChange={(value) => setProgress(value[0])}
            max={100}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="note">Update Note</Label>
          <Textarea
            id="note"
            placeholder="Add a note about this progress update..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export function GoalSheet({ goal, onProgressUpdate, trigger }: GoalSheetProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

          {/* Updates Section */}
          {goal.updates && goal.updates.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Recent Updates</h3>
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

          {/* Update Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Update Progress</Button>
            </DialogTrigger>
            <UpdateProgressDialog
              goal={goal}
              onProgressUpdate={onProgressUpdate}
              onOpenChange={setIsDialogOpen}
            />
          </Dialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
