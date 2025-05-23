"use client";

import { useRouter } from "next/router";
import useSWR from "swr";
import axios from "axios";
import { format } from "date-fns";
import CoachLayout from "@/layouts/CoachLayouts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  ArrowLeft,
  MapPin,
  Target,
  CheckCircle2,
  XCircle,
  Clock4,
} from "lucide-react";
import Link from "next/link";
import { useOrganization } from "@/hooks/useOrganization";
import { GoalCard } from "@/components/GoalCard";
import { GoalSheet } from "@/components/UpdateGoalDialog";
import { toast } from "sonner";
import Image from "next/image";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface Entrepreneur extends User {
  joinedAt: string;
}

interface Session {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  price: number;
  coach: User;
  entrepreneurs: Entrepreneur[];
  createdAt: string;
  updatedAt: string;
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  entrepreneurId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  organizationId: string;
  coachId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  updates: Array<{
    updatedBy?: string;
    content?: string;
    timestamp?: string;
  }>;
  createdAt: string;
  __v: number;
}

interface SessionResponse {
  session: Session;
  goals: Goal[];
}

const formatDateTime = (dateString: string | undefined, formatStr: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return format(date, formatStr);
  } catch (error) {
    return "";
  }
};

const formatDate = (dateString: string | undefined) =>
  formatDateTime(dateString, "MMM d, yyyy");
const formatTime = (dateString: string | undefined) =>
  formatDateTime(dateString, "h:mm a");

async function fetchSessionData(url: string) {
  const response = await axios.get<SessionResponse>(url, {
    withCredentials: true,
  });
  return response.data;
}

const getGoalStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "in_progress":
      return <Clock4 className="h-5 w-5 text-yellow-500" />;
    default:
      return <Target className="h-5 w-5 text-gray-500" />;
  }
};

export default function CoachSessionDetails() {
  const { selectedOrganization } = useOrganization();
  const router = useRouter();
  const { id } = router.query;

  const { data, error, mutate } = useSWR(
    id && selectedOrganization?.id
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions/${id}?organizationId=${selectedOrganization.id}`
      : null,
    fetchSessionData
  );

  const handleGoalUpdate = async (
    goalId: string,
    progress: number,
    note: string
  ) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/goals/${goalId}`,
        {
          progress,
          update: {
            content: note,
          },
        },
        { withCredentials: true }
      );
      await mutate(); // This will refresh both session and goals data
      toast.success("Goal updated successfully");
    } catch (error) {
      toast.error("Failed to update goal");
      console.error("Error updating goal:", error);
    }
  };

  if (error) {
    return (
      <CoachLayout>
        <div className="p-6">
          <div className="text-center text-red-600">
            Error loading session details
          </div>
        </div>
      </CoachLayout>
    );
  }

  if (!data) {
    return (
      <CoachLayout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </CoachLayout>
    );
  }

  const { session, goals } = data;

  return (
    <CoachLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/coach/sessions">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Sessions
            </Button>
          </Link>
          <Badge
            variant={session.status === "scheduled" ? "outline" : "default"}
            className="text-sm"
          >
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Details Card */}
          <Card className="p-6 space-y-6 lg:col-span-2">
            <div>
              <h1 className="text-2xl font-semibold mb-2">{session.title}</h1>
              <p className="text-muted-foreground">{session.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{formatDate(session.startTime)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>
                  {formatTime(session.startTime)} -{" "}
                  {formatTime(session.endTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{session.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span>{session.price} MAD</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {session.createdAt &&
                  `Created ${formatDate(session.createdAt)}`}
                {session.updatedAt &&
                  session.createdAt !== session.updatedAt &&
                  ` • Updated ${formatDate(session.updatedAt)}`}
              </p>
            </div>
          </Card>

          {/* Entrepreneurs Card */}
          <Card className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Entrepreneurs</h2>
              <div className="space-y-3">
                {session.entrepreneurs.map((entrepreneur) => (
                  <div
                    key={entrepreneur._id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {entrepreneur.profileImage ? (
                      <Image
                        src={entrepreneur.profileImage}
                        alt={`${entrepreneur.firstName} ${entrepreneur.lastName}`}
                        className="h-10 w-10 rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {entrepreneur.firstName} {entrepreneur.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entrepreneur.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Goals Card */}
          <Card className="space-y-6 lg:col-span-3 p-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Session Goals</h2>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/coach/goals/new?sessionId=${session._id}`)
                  }
                >
                  Add Goal
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No goals have been set for this session yet.
                  </div>
                ) : (
                  goals.map((goal) => (
                    <Card key={goal._id} className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            For: {goal.entrepreneurId.firstName}{" "}
                            {goal.entrepreneurId.lastName}
                          </p>
                        </div>
                        {getGoalStatusIcon(goal.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between">
                        <GoalSheet
                          goal={goal}
                          onProgressUpdate={handleGoalUpdate}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              View Details
                            </Button>
                          }
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CoachLayout>
  );
}
