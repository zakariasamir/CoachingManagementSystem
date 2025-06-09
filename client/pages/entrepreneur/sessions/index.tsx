import { SessionCard } from "@/components/SessionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import useSWR from "swr";
import axios from "axios";
import EntrepreneurLayout from "@/layouts/Entrepreneur";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
}

interface Session {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "completed" | "cancelled";
  price: number;
  participants: Array<{
    _id: string;
    userId: User;
    role: "coach" | "entrepreneur";
  }>;
}

async function fetchSessions(url: string) {
  const response = await axios.get<Session[]>(url, { withCredentials: true });
  return response.data;
}

export default function EntrepreneurSessions() {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const {
    data: sessions,
    isLoading,
    error,
  } = useSWR(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/entrepreneur/sessions?organizationId=${organizationId}`
      : null,
    fetchSessions
  );

  if (error) return <div className="p-6">Failed to load sessions</div>;

  return (
    <EntrepreneurLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Your Sessions</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!sessions || isLoading ? (
            <>
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px] hidden md:block" />
              <Skeleton className="h-[200px] hidden lg:block" />
            </>
          ) : sessions?.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No sessions found
            </div>
          ) : (
            sessions?.map((session) => {
              const coach = session.participants.find(
                (p) => p.role === "coach"
              )?.userId;
              const entrepreneurs = session.participants
                .filter((p) => p.role === "entrepreneur")
                .map((p) => p.userId);

              return (
                <SessionCard
                  key={session._id}
                  session={{
                    id: session._id,
                    title: session.title,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    status: session.status,
                    price: session.price || 0,
                    coach: coach
                      ? {
                          firstName: coach.firstName,
                          lastName: coach.lastName,
                        }
                      : {
                          firstName: "No",
                          lastName: "Coach",
                        },
                    entrepreneursCount: entrepreneurs.length,
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </EntrepreneurLayout>
  );
}
