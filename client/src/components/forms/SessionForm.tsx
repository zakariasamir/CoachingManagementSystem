// src/components/SessionForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sessionData: any) => void;
}

const SessionForm = ({ isOpen, onClose, onSubmit }: SessionFormProps) => {
  const [sessionData, setSessionData] = useState({
    title: "",
    date: "",
    coach: "",
    entrepreneur: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    onSubmit(sessionData);
    onClose(); // Close the modal after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[400px]">
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
          <DialogDescription>Create a new coaching session.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              name="title"
              value={sessionData.title}
              onChange={handleChange}
              placeholder="Session title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Session Date</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              value={sessionData.date}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach">Coach</Label>
            <Select
              name="coach"
              value={sessionData.coach}
              onValueChange={(value) =>
                handleChange({ target: { name: "coach", value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Coach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coach1">Coach 1</SelectItem>
                <SelectItem value="coach2">Coach 2</SelectItem>
                <SelectItem value="coach3">Coach 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrepreneur">Entrepreneur</Label>
            <Select
              name="entrepreneur"
              value={sessionData.entrepreneur}
              onValueChange={(value) =>
                handleChange({ target: { name: "entrepreneur", value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Entrepreneur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrepreneur1">Entrepreneur 1</SelectItem>
                <SelectItem value="entrepreneur2">Entrepreneur 2</SelectItem>
                <SelectItem value="entrepreneur3">Entrepreneur 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={sessionData.notes}
              onChange={handleChange}
              placeholder="Add session notes"
            />
          </div>

          <Button onClick={handleFormSubmit} className="w-full">
            Save Session
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionForm;
