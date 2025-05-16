import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  organizationId: string;
}

async function fetchUsers(url: string) {
  const response = await axios.get<User[]>(url, { withCredentials: true });
  return response.data;
}

const GoalForm = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
}: GoalFormProps) => {
  const [goalData, setGoalData] = useState({
    title: "",
    description: "",
    coachId: "",
    entrepreneurId: "",
    status: "not_started",
    progress: 0,
  });

  const { data: coaches } = useSWR(
    organizationId
      ? `${
          process.env.NEXT_PUBLIC_VITE_BASE_URL
        }/users?organizationId=${organizationId}&role=coach`
      : null,
    fetchUsers
  );

  const { data: entrepreneurs } = useSWR(
    organizationId
      ? `${
          process.env.NEXT_PUBLIC_VITE_BASE_URL
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
    setGoalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(goalData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Goal</DialogTitle>
          <DialogDescription>Set up a new goal</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              name="title"
              value={goalData.title}
              onChange={handleChange}
              placeholder="Enter goal title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={goalData.description}
              onChange={handleChange}
              placeholder="Enter goal description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coachId">Coach</Label>
            <Select
              name="coachId"
              value={goalData.coachId}
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
              value={goalData.entrepreneurId}
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

          <Button type="submit" className="w-full">
            Create Goal
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;