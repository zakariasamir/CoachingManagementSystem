// src/components/SessionForm.tsx
import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface SessionFormData {
  title: string;
  startTime: string;
  endTime: string;
  coachId: string;
  entrepreneurId: string;
  notes: string;
}

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionFormData) => Promise<void>;
  organizationId: string;
}

async function fetchUsers(url: string) {
  const response = await axios.get<User[]>(url, { withCredentials: true });
  return response.data;
}

const SessionForm = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
}: SessionFormProps) => {
  const [sessionData, setSessionData] = useState<SessionFormData>({
    title: "",
    startTime: "",
    endTime: "",
    coachId: "",
    entrepreneurId: "",
    notes: "",
  });

  const { data: coaches } = useSWR<User[]>(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/users?organizationId=${organizationId}&role=coach`
      : null,
    fetchUsers
  );

  const { data: entrepreneurs } = useSWR<User[]>(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/users?organizationId=${organizationId}&role=entrepreneur`
      : null,
    fetchUsers
  );

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(sessionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
          <DialogDescription>Set up a new coaching session</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              name="title"
              value={sessionData.title}
              onChange={handleChange}
              placeholder="Enter session title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={sessionData.startTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="datetime-local"
              value={sessionData.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coachId">Coach</Label>
            <Select
              name="coachId"
              value={sessionData.coachId}
              onValueChange={(value) =>
                handleChange({ target: { name: "coachId", value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a coach" />
              </SelectTrigger>
              <SelectContent>
                {coaches?.map((coach) => (
                  <SelectItem key={coach._id} value={coach._id}>
                    {`${coach.firstName} ${coach.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="entrepreneurId">Entrepreneur</Label>
            <Select
              name="entrepreneurId"
              value={sessionData.entrepreneurId}
              onValueChange={(value) =>
                handleChange({ target: { name: "entrepreneurId", value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an entrepreneur" />
              </SelectTrigger>
              <SelectContent>
                {entrepreneurs?.map((entrepreneur) => (
                  <SelectItem key={entrepreneur._id} value={entrepreneur._id}>
                    {`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={sessionData.notes}
              onChange={handleChange}
              placeholder="Add any session notes..."
            />
          </div>

          <Button type="submit" className="w-full">
            Create Session
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SessionForm;
