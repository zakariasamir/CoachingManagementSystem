import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

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
    entrepreneurIds: [],
    notes: "",
    price: 0,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredEntrepreneurs = entrepreneurs?.filter((entrepreneur) => {
    if (!searchQuery.trim()) return true;
    const fullName =
      `${entrepreneur.firstName} ${entrepreneur.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase().trim());
  });

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

  const handleEntrepreneurSelect = (entrepreneurId: string) => {
    setSessionData((prev) => ({
      ...prev,
      entrepreneurIds: prev.entrepreneurIds.includes(entrepreneurId)
        ? prev.entrepreneurIds.filter((id) => id !== entrepreneurId)
        : [...prev.entrepreneurIds, entrepreneurId],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      await onSubmit({
        ...sessionData,
      });
      setSessionData({
        title: "",
        startTime: "",
        endTime: "",
        coachId: "",
        entrepreneurIds: [],
        notes: "",
        price: 0,
      });
      onClose();
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
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

          <div className="grid grid-cols-2 gap-4">
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
            <Label>Entrepreneurs</Label>
            <Card className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entrepreneurs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {filteredEntrepreneurs?.map((entrepreneur) => (
                    <div
                      key={entrepreneur._id}
                      className="flex items-center space-x-3"
                    >
                      <div className="flex-1 flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`entrepreneur-${entrepreneur._id}`}
                          checked={sessionData.entrepreneurIds.includes(
                            entrepreneur._id
                          )}
                          onChange={() =>
                            handleEntrepreneurSelect(entrepreneur._id)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label
                          htmlFor={`entrepreneur-${entrepreneur._id}`}
                          className="flex-1 text-sm font-medium leading-none hover:cursor-pointer"
                        >
                          {`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                        </label>
                      </div>
                    </div>
                  ))}
                  {filteredEntrepreneurs?.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No entrepreneurs found
                    </p>
                  )}
                </div>
              </ScrollArea>
              {sessionData.entrepreneurIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  {entrepreneurs
                    ?.filter((e) => sessionData.entrepreneurIds.includes(e._id))
                    .map((entrepreneur) => (
                      <Badge
                        key={entrepreneur._id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                        <button
                          type="button"
                          onClick={() =>
                            handleEntrepreneurSelect(entrepreneur._id)
                          }
                          className="hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
              )}
            </Card>
            {errors.entrepreneurIds && (
              <p className="text-sm text-red-500">{errors.entrepreneurIds}</p>
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
