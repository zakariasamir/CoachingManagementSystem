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
import { SessionFormData, User } from "@/types/session";

interface SessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SessionFormData) => Promise<void>;
  organizationId: string;
}

interface ValidationErrors {
  [key: string]: string;
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
    price: 0,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const { data: coaches } = useSWR<User[]>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/users?organizationId=${organizationId}&role=coach`
      : null,
    fetchUsers
  );

  const { data: entrepreneurs } = useSWR<User[]>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/users?organizationId=${organizationId}&role=entrepreneur`
      : null,
    fetchUsers
  );

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;
    setSessionData((prev) => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      await onSubmit({
        ...sessionData,
      });
      // Reset form
      setSessionData({
        title: "",
        startTime: "",
        endTime: "",
        coachId: "",
        entrepreneurId: "",
        notes: "",
        price: 0,
      });
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error(
          "Session creation error:",
          error.response?.data || error.message
        );
      }
    }
  };

  // Helper function to get error message for a field
  const getErrorMessage = (field: string) => errors[field];

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
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
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
              className={errors.startTime ? "border-red-500" : ""}
            />
            {errors.startTime && (
              <p className="text-sm text-red-500">{errors.startTime}</p>
            )}
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
              className={errors.endTime ? "border-red-500" : ""}
            />
            {errors.endTime && (
              <p className="text-sm text-red-500">{errors.endTime}</p>
            )}
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
              <SelectTrigger className={errors.coachId ? "border-red-500" : ""}>
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
            {errors.coachId && (
              <p className="text-sm text-red-500">{errors.coachId}</p>
            )}
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
              <SelectTrigger
                className={errors.entrepreneurId ? "border-red-500" : ""}
              >
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
            {errors.entrepreneurId && (
              <p className="text-sm text-red-500">{errors.entrepreneurId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="5"
              value={sessionData.price}
              onChange={handleChange}
              placeholder="Enter session price"
              required
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={sessionData.notes}
              onChange={handleChange}
              placeholder="Add any session notes..."
              className={errors.notes ? "border-red-500" : ""}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes}</p>
            )}
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
