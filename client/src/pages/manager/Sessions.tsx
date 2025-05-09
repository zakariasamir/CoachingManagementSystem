import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SessionForm from "@/components/forms/SessionForm";
import { toast } from "sonner";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Participant {
  _id: string;
  sessionId: string;
  userId: User;
  role: "coach" | "entrepreneur";
  joinedAt: string;
  // user: User;
}

interface Session {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
  participants: Participant[];
}

interface SessionCardProps {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  coach: string;
  entrepreneur: string;
}

interface SessionFormData {
  title: string;
  startTime: string;
  endTime: string;
  coachId: string;
  entrepreneurId: string;
  notes: string;
}

// Update the mapping logic with better type safety
const mapSessionToCardProps = (session: Session): SessionCardProps => {
  const coachParticipant = session.participants.find((p) => p.role === "coach");
  const entrepreneurParticipant = session.participants.find(
    (p) => p.role === "entrepreneur"
  );

  return {
    id: session._id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    notes: "",
    coach: coachParticipant
      ? `${coachParticipant.userId.firstName} ${coachParticipant.userId.lastName}`
      : "No coach assigned",
    entrepreneur: entrepreneurParticipant
      ? `${entrepreneurParticipant.userId.firstName} ${entrepreneurParticipant.userId.lastName}`
      : "No entrepreneur assigned",
  };
};

async function fetchSessions(url: string) {
  const response = await axios.get<Session[]>(url, { withCredentials: true });
  return response.data;
}

const Sessions = () => {
  const [isSessionFormOpen, setSessionFormOpen] = useState(false);
  const { data } = useAuth();
  const organizationId = data?.user?.organizations[0]?.id;

  const {
    data: sessions,
    // error,
    mutate,
  } = useSWR(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/manager/sessions?organizationId=${organizationId}`
      : null,
    fetchSessions,
    {
      revalidateOnFocus: false,
    }
  );

  const handleAddSession = async (sessionData: SessionFormData) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/manager/sessions`,
        { ...sessionData, organizationId },
        { withCredentials: true }
      );

      await mutate();
      setSessionFormOpen(false);
      toast.success("Session created successfully");
    } catch (error) {
      toast.error("Failed to create session");
      console.error("Error creating session:", error);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Manage Sessions</h1>
        <Button onClick={() => setSessionFormOpen(true)}>New Session +</Button>
      </div>

      <SessionForm
        isOpen={isSessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
        onSubmit={handleAddSession}
        organizationId={organizationId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!sessions ? (
          <>
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px] hidden md:block" />
            <Skeleton className="h-[200px] hidden lg:block" />
          </>
        ) : sessions.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No sessions found. Create your first session!
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={mapSessionToCardProps(session)}
              onStatusChange={async (newStatus) => {
                try {
                  await axios.patch(
                    `${import.meta.env.VITE_BASE_URL}/sessions/${
                      session._id
                    }/status`,
                    { status: newStatus },
                    { withCredentials: true }
                  );
                  await mutate();
                  toast.success("Session status updated");
                } catch (err) {
                  const error = err as Error;
                  console.error("Failed to update session status:", error);
                  toast.error(
                    axios.isAxiosError(error)
                      ? error.response?.data?.message ||
                          "Failed to update session status"
                      : "Failed to update session status"
                  );
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Sessions;
