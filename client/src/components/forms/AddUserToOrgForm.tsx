import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import useSWR from "swr";

interface Organization {
  _id: string;
  name: string;
}

interface AddUserToOrgFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => Promise<void>;
}

async function fetchOrganizations(url: string) {
  const response = await axios.get<Organization[]>(url, {
    withCredentials: true,
  });
  return response.data;
}

export function AddUserToOrgForm({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: AddUserToOrgFormProps) {
  const [selectedOrg, setSelectedOrg] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: organizations } = useSWR(
    `${import.meta.env.VITE_BASE_URL}/manager/organizations`,
    fetchOrganizations
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !selectedRole) {
      toast.error("Please select both organization and role");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/manager/organizations/users`,
        {
          userId,
          organizationId: selectedOrg,
          role: selectedRole,
        },
        { withCredentials: true }
      );

      await onSuccess();
      toast.success("User added to organization successfully");
      onClose();
      setSelectedOrg("");
      setSelectedRole("");
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message ||
              "Failed to add user to organization"
          : "Failed to add user to organization"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add User to Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger>
              <SelectValue placeholder="Select organization" />
            </SelectTrigger>
            <SelectContent>
              {organizations?.map((org) => (
                <SelectItem key={org._id} value={org._id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="coach">Coach</SelectItem>
              <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
            </SelectContent>
          </Select>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding..." : "Add to Organization"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
