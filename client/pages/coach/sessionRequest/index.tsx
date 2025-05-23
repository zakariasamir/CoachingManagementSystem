import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { format } from "date-fns";
import CoachLayout from "@/layouts/CoachLayouts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Session {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "requested" | "scheduled" | "completed" | "cancelled" | "declined";
  isAccepted: boolean;
  createdAt: string;
  coach: User;
  entrepreneurs: User[];
}

export default function SessionRequests() {
  const router = useRouter();
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      if (!organizationId) return;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions/requests?organizationId=${organizationId}`,
        { withCredentials: true }
      );
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      toast.error("Failed to load session requests");
    }
  };

  useEffect(() => {
    fetchSessions();
  });

  const handleViewDetails = (sessionId: string) => {
    router.push(`/coach/sessionRequest/${sessionId}`);
  };

  if (isLoading || isOrgLoading || !selectedOrganization) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CoachLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Session Requests</h1>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Entrepreneurs</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session._id}>
                  <TableCell>{session.title}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {session.entrepreneurs.length > 0 ? (
                        session.entrepreneurs.map((entrepreneur) => (
                          <div key={entrepreneur._id}>
                            {`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No entrepreneurs
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(session.startTime), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    {`${format(
                      new Date(session.startTime),
                      "HH:mm"
                    )} - ${format(new Date(session.endTime), "HH:mm")}`}
                  </TableCell>
                  <TableCell>{session.price} MAD</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        session.status === "requested"
                          ? "destructive"
                          : session.status === "scheduled"
                          ? "outline"
                          : "default"
                      }
                      className="capitalize"
                    >
                      {session.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(session._id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </CoachLayout>
  );
}
