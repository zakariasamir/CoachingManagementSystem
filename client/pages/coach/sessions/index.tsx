import { SessionCard } from "@/components/SessionCard";
import CoachLayout from "@/layouts/CoachLayouts";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import axios from "axios";
// import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Session {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  participants: Array<{
    _id: string;
    userId: User;
    role: "coach" | "entrepreneur";
  }>;
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

async function fetchSessions(url: string) {
  const response = await axios.get<Session[]>(url, { withCredentials: true });
  return response.data;
}

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

export default function CoachSessions() {
  // const { data } = useAuth();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const {
    data: sessions,
    error,
    mutate,
  } = useSWR(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions?organizationId=${organizationId}`
      : null,
    fetchSessions
  );

  const handleStatusChange = async (sessionId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/sessions/${sessionId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      await mutate();
      toast.success("Session status updated");
    } catch (error) {
      toast.error("Failed to update session status");
      console.error("Error updating session status:", error);
    }
  };

  if (error) return <div className="p-6">Failed to load sessions</div>;

  return (
    <CoachLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Coach Sessions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!sessions ? (
            <>
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px] hidden md:block" />
              <Skeleton className="h-[200px] hidden lg:block" />
            </>
          ) : sessions.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No sessions found
            </div>
          ) : (
            sessions.map((session) => (
              <SessionCard
                key={session._id}
                session={mapSessionToCardProps(session)}
                onStatusChange={(status) =>
                  handleStatusChange(session._id, status)
                }
              />
            ))
          )}
        </div>
      </div>
    </CoachLayout>
  );
}
