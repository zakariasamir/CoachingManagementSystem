import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface UpdateGoalDialogProps {
  goal: {
    _id: string;
    title: string;
    description: string;
    progress: number;
    status: "not-started" | "in-progress" | "completed";
    updates: Array<{
      updatedBy?: string;
      content?: string;
      timestamp?: string;
    }>;
  };
  onProgressUpdate: (goalId: string, progress: number, note: string) => Promise<void>;
}

export function UpdateGoalDialog({ goal, onProgressUpdate }: UpdateGoalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(goal.progress);
  const [note, setNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async () => {
    setIsUpdating(true);
    try {
      await onProgressUpdate(goal._id, progress, note);
      setIsOpen(false);
      setNote("");
    } catch (error) {
      console.error("Failed to update goal:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Update Goal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Goal: {goal.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Progress</label>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground text-right">{progress}%</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Note</label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this update..."
              className="min-h-[100px]"
            />
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isUpdating || (progress === goal.progress && !note)}
            className="w-full"
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}