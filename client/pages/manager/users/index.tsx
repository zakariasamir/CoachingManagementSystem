import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import ManagerLayout from "@/layouts/ManagerLayout";
import { useOrganization } from "@/hooks/useOrganization";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AddUserToOrgForm } from "@/components/forms/AddUserToOrgForm";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "coach" | "entrepreneur";
  status: "active" | "inactive";
}

async function fetchUsers(url: string) {
  const response = await axios.get<User[]>(url, { withCredentials: true });
  return response.data;
}

export default function Users() {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [addToOrgFormOpen, setAddToOrgFormOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: users,
    error,
    isLoading,
    mutate,
  } = useSWR(
    organizationId
      ? `${
          process.env.NEXT_PUBLIC_VITE_BASE_URL
        }/manager/users?organizationId=${organizationId}${
          roleFilter !== "all" ? `&role=${roleFilter}` : ""
        }`
      : null,
    fetchUsers
  );

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/manager/users/${userId}/status`,
        { status: newStatus },
        { withCredentials: true }
      );
      await mutate();
      toast.success("User status updated successfully");
    } catch (error) {
      toast.error("Failed to update user status");
      console.error("Error updating user status:", error);
    }
  };

  const filteredUsers = users?.filter((user) =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (error) return <div className="p-6">Failed to load users</div>;

  return (
    <ManagerLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex gap-4">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {!users || isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          defaultValue={user.status}
                          onValueChange={(value) =>
                            handleStatusChange(user._id, value)
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          className="h-9"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUserId(user._id);
                            setAddToOrgFormOpen(true);
                          }}
                        >
                          Add to Org
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <AddUserToOrgForm
          isOpen={addToOrgFormOpen}
          onClose={() => setAddToOrgFormOpen(false)}
          userId={selectedUserId}
          onSuccess={() => {
            mutate();
          }}
        />
      </div>
    </ManagerLayout>
  );
}
