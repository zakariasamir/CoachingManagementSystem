import { StatsCard } from "@/components/StatsCard";
import useSWR from "swr";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";

interface Stats {
  totalSessions: number;
  activeGoals: number;
  payments: number;
}

async function fetchStats(url: string) {
  const response = await axios.get<Stats>(url, { withCredentials: true });
  return response.data;
}

export default function ManagerDashboard() {
  const { data } = useAuth();
  const organizationId = data?.user?.organizations[0]?.id;
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<Stats>(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/manager/dashboard?organizationId=${organizationId}`
      : null,
    fetchStats,
    {
      revalidateOnFocus: false,
    }
  );

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load stats. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32 hidden sm:block" />
            <Skeleton className="h-32 hidden lg:block" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Sessions"
              value={stats?.totalSessions ?? 0}
              icon="sessions"
            />
            <StatsCard
              title="Active Goals"
              value={stats?.activeGoals ?? 0}
              icon="goals"
            />
            <StatsCard
              title="Payments"
              value={stats?.payments ?? 0}
              icon="payments"
            />
          </>
        )}
      </div>
    </div>
  );
}
