import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import axios from "axios";
import CoachLayout from "@/layouts/CoachLayouts";
import { useOrganization } from "@/hooks/useOrganization";
import { CoachCharts } from "@/components/charts/CoachCharts";

interface Stats {
  monthlyData: Array<{
    month: string;
    sessions: {
      total: number;
      completed: number;
      upcoming: number;
    };
    goals: {
      total: number;
      completed: number;
      inProgress: number;
    };
  }>;
  totals: {
    sessions: {
      total: number;
      completed: number;
      upcoming: number;
    };
    goals: {
      total: number;
      completed: number;
      inProgress: number;
    };
  };
}

async function fetchStats(url: string) {
  const response = await axios.get<Stats>(url, {
    withCredentials: true,
  });
  return response.data;
}

export default function CoachDashboard() {
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const { data: stats, error } = useSWR(
    `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${selectedOrganization?.role}/dashboard?organizationId=${organizationId}`,
    fetchStats
  );

  if (error) return <div className="p-6">Failed to load dashboard stats</div>;

  return (
    <CoachLayout>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>
        </div>
        {!isOrgLoading && stats && <CoachCharts stats={stats} />}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!stats ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32 hidden sm:block" />
              <Skeleton className="h-32 hidden lg:block" />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Sessions"
                value={stats.totals.sessions.total ?? 0}
                icon="sessions"
              />
              <StatsCard
                title="Active Goals"
                value={stats.totals.goals.total ?? 0}
                icon="goals"
              />
              <StatsCard
                title="Completed Sessions"
                value={stats.totals.sessions.completed ?? 0}
                icon="check"
              />
            </>
          )}
        </div>
      </div>
    </CoachLayout>
  );
}
