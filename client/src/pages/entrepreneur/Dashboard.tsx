import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import useSWR from "swr";
import axios from "axios";

interface DashboardStats {
  totalGoals: number;
  completedGoals: number;
  totalSessions: number;
}

async function fetchStats(url: string) {
  const response = await axios.get<DashboardStats>(url, {
    withCredentials: true,
  });
  return response.data;
}

export default function EntrepreneurDashboard() {
  // const { data } = useAuth();
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/entrepreneur/dashboard?organizationId=${organizationId}`
      : null,
    fetchStats,
    {
      revalidateOnFocus: false,
    }
  );

  if (error) return <div className="p-6">Failed to load dashboard stats</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Active Goals"
            value={stats?.totalGoals ?? 0}
            icon="goals"
          />
          <StatsCard
            title="Completed Goals"
            value={stats?.completedGoals ?? 0}
            icon="check"
          />
          <StatsCard
            title="Total Sessions"
            value={stats?.totalSessions ?? 0}
            icon="sessions"
          />
        </div>
      )}
    </div>
  );
}
