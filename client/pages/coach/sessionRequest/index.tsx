import { useEffect, useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Clock,
  Calendar,
  User,
  DollarSign,
  FileText,
  Loader2,
} from "lucide-react";
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
  entrepreneur: User;
}

export default function SessionRequests() {
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
  }, [organizationId]);

  const handleUpdateSession = async (
    sessionId: string,
    isAccepted: boolean
  ) => {
    setIsLoading(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions/${sessionId}/update`,
        { isAccepted },
        { withCredentials: true }
      );
      toast.success("Session updated successfully");
      fetchSessions();
      setIsDrawerOpen(false);
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (session: Session) => {
    setSelectedSession(session);
    setIsDrawerOpen(true);
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
                <TableHead>Entrepreneur</TableHead>
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
                    {`${session.entrepreneur.firstName} ${session.entrepreneur.lastName}`}
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
                      onClick={() => handleViewDetails(session)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetContent className="sm:max-w-[500px] overflow-y-auto p-6">
            {selectedSession && (
              <div className="space-y-6 relative">
                <SheetHeader>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="text-2xl font-bold">
                        {selectedSession.title}
                      </SheetTitle>
                      <Badge
                        variant={
                          selectedSession.status === "requested"
                            ? "destructive"
                            : selectedSession.status === "scheduled"
                            ? "outline"
                            : "default"
                        }
                        className="capitalize"
                      >
                        {selectedSession.status}
                      </Badge>
                    </div>
                  </div>
                </SheetHeader>

                <Separator />

                <div className="grid gap-6">
                  {/* Entrepreneur Info */}
                  <Card className="p-4">
                    <div className="flex items-start space-x-4">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Entrepreneur
                        </p>
                        <p className="font-medium">
                          {`${selectedSession.entrepreneur.firstName} ${selectedSession.entrepreneur.lastName}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedSession.entrepreneur.email}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Date & Time */}
                  <Card className="p-4">
                    <div className="flex items-start space-x-4">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Date
                        </p>
                        <p className="font-medium">
                          {format(
                            new Date(selectedSession.startTime),
                            "MMMM dd, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-start space-x-4">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Time
                        </p>
                        <p className="font-medium">
                          {`${format(
                            new Date(selectedSession.startTime),
                            "HH:mm"
                          )} - ${format(
                            new Date(selectedSession.endTime),
                            "HH:mm"
                          )}`}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Price */}
                  <Card className="p-4">
                    <div className="flex items-start space-x-4">
                      <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Price
                        </p>
                        <p className="font-medium">
                          {selectedSession.price} MAD
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Action Buttons */}
                  <div className="space-y-3 sticky h-full bottom-0 left-0 right-0">
                    {/* Status Update Buttons */}
                    {!selectedSession.isAccepted && (
                      <div className="flex flex-col gap-3">
                        <Button
                          size="lg"
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleUpdateSession(selectedSession._id, true)
                          }
                          disabled={isLoading}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept Session
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="w-full text-red-500 border-red-500 hover:text-amber-50 hover:bg-red-600"
                          onClick={() =>
                            handleUpdateSession(selectedSession._id, false)
                          }
                          disabled={isLoading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline Session
                        </Button>
                      </div>
                    )}

                    {/* Session Acceptance Toggle */}
                    {selectedSession.isAccepted && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground text-center">
                          Update Session Status
                        </p>
                        <div className="flex gap-3">
                          <Button
                            size="lg"
                            variant={
                              selectedSession.status === "completed"
                                ? "default"
                                : "outline"
                            }
                            className="flex-1"
                            onClick={() =>
                              handleUpdateSession(selectedSession._id, true)
                            }
                            disabled={isLoading}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Completed
                          </Button>
                          <Button
                            size="lg"
                            variant={
                              selectedSession.status === "scheduled"
                                ? "default"
                                : "outline"
                            }
                            className="flex-1"
                            onClick={() =>
                              handleUpdateSession(selectedSession._id, false)
                            }
                            disabled={isLoading}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Scheduled
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </CoachLayout>
  );
}
