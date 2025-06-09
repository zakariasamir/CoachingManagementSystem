import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import ManagerLayout from "@/layouts/ManagerLayout";
import { useOrganization } from "@/hooks/useOrganization";
import { useAuth } from "@/hooks/useAuth";
import { SessionCard } from "@/components/SessionCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import SessionForm from "@/components/forms/SessionForm";
import { toast } from "sonner";
import { SessionFormData, SessionCardProps, Session } from "@/types/session";

const mapSessionToCardProps = (session: Session): SessionCardProps => {
  const coachParticipant = session.participants.find((p) => p.role === "coach");
  const entrepreneurs = session.participants.filter(
    (p) => p.role === "entrepreneur"
  );

  return {
    id: session._id,
    title: session.title,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status as
      | "scheduled"
      | "completed"
      | "requested"
      | "declined",
    price: session.price || 0,
    notes: session.notes || "",
    coach: {
      firstName: coachParticipant?.userId.firstName || "No",
      lastName: coachParticipant?.userId.lastName || "Coach",
    },
    entrepreneursCount: entrepreneurs.length,
  };
};

async function fetchSessions(url: string) {
  const response = await axios.get<Session[]>(url, { withCredentials: true });
  return response.data;
}

const Sessions = () => {
  const [isSessionFormOpen, setSessionFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const {
    data: sessions,
    isLoading,
    error,
    mutate,
  } = useSWR(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/manager/sessions?organizationId=${organizationId}`
      : null,
    fetchSessions,
    {
      revalidateOnFocus: false,
    }
  );

  const handleAddSession = async (sessionData: SessionFormData) => {
    setIsCreating(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/manager/sessions`,
        { ...sessionData, organizationId },
        { withCredentials: true }
      );

      await mutate();
      setSessionFormOpen(false);
      toast.success("Session created successfully");
    } catch (error) {
      toast.error("Failed to create session");
      console.error("Error creating session:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ManagerLayout>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Manage Sessions</h1>
          <Button onClick={() => setSessionFormOpen(true)}>
            New Session +
          </Button>
        </div>

        <SessionForm
          isOpen={isSessionFormOpen}
          onClose={() => setSessionFormOpen(false)}
          onSubmit={handleAddSession}
          organizationId={organizationId || ""}
          isCreating={isCreating}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!sessions || isLoading ? (
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
              />
            ))
          )}
        </div>
      </div>
    </ManagerLayout>
  );
};

export default Sessions;
