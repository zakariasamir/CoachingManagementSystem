import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { format } from "date-fns";
import CoachLayout from "@/layouts/CoachLayouts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Check,
  X,
  Calendar,
  User,
  DollarSign,
  FileText,
  Loader2,
  ArrowLeft,
  Mail,
} from "lucide-react";
import { useOrganization } from "@/hooks/useOrganization";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  notes?: string;
}

export default function SessionRequestDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchSession = async () => {
    if (!id || !organizationId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions/requests/${id}?organizationId=${organizationId}`,
        { withCredentials: true }
      );
      setSession(response.data);
    } catch (error) {
      console.error("Failed to fetch session:", error);
      toast.error("Failed to load session details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  });

  const handleUpdateSession = async (isAccepted: boolean) => {
    if (!session) return;
    setIsActionLoading(true);
    try {
      console.log(isAccepted);
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions/${session._id}/status`,
        { isAccepted },
        { withCredentials: true }
      );
      toast.success(
        `Session ${isAccepted ? "accepted" : "declined"} successfully`
      );
      router.push("/coach/sessions");
    } catch (error) {
      console.error("Failed to update session:", error);
      toast.error("Failed to update session");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading || !session) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="container mx-auto py-10">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{session.title}</h1>
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
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Date & Time */}
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Date & Time
                    </p>
                    <p className="font-medium">
                      {format(new Date(session.startTime), "MMMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {`${format(
                        new Date(session.startTime),
                        "HH:mm"
                      )} - ${format(new Date(session.endTime), "HH:mm")}`}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Price */}
              <Card className="p-6">
                <div className="flex items-start space-x-4">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Price
                    </p>
                    <p className="font-medium">{session.price} MAD</p>
                  </div>
                </div>
              </Card>

              {/* Notes */}
              {session.notes && (
                <Card className="p-6">
                  <div className="flex items-start space-x-4">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Notes
                      </p>
                      <p className="text-sm">{session.notes}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Entrepreneurs */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Entrepreneurs ({session.entrepreneurs.length})
                  </p>
                </div>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {session.entrepreneurs.map((entrepreneur) => (
                      <div
                        key={entrepreneur._id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                            </p>
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  (window.location.href = `mailto:${entrepreneur.email}`)
                                }
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{entrepreneur.email}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          {session.status === "requested" && (
            <div className="flex space-x-4 mt-8">
              <Button
                className="flex-1"
                onClick={() => handleUpdateSession(true)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Accept Session
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleUpdateSession(false)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Decline Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </CoachLayout>
  );
}
