import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import useSWR from "swr";
import axios from "axios";
import EntrepreneurLayout from "@/layouts/Entrepreneur";
import { EntrepreneurCharts } from '@/components/charts/EntrepreneurCharts';

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

export default function EntrepreneurDashboard() {
  // const { data } = useAuth();
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const {
    data: stats,
    error,
    isLoading,
  } = useSWR(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/entrepreneur/dashboard?organizationId=${organizationId}`
      : null,
    fetchStats,
    {
      revalidateOnFocus: false,
    }
  );

  // if (error) return <div className="p-6">Failed to load dashboard stats</div>;

  return (
    <EntrepreneurLayout>
      <div className="space-y-6 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>
              </div>
              {!isLoading && stats && <EntrepreneurCharts stats={stats} />}
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
    </EntrepreneurLayout>
  );
}
