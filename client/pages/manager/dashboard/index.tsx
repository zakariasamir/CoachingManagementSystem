import { StatsCard } from "@/components/StatsCard";
import useSWR from "swr";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import ManagerLayout from "@/layouts/ManagerLayout";
import { Loader2 } from "lucide-react";
import { ManagerCharts } from "@/components/charts/ManagerCharts";

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
    participants: {
      total: number;
      coaches: number;
      entrepreneurs: number;
    };
    revenue: number;
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
    participants: {
      total: number;
      coaches: number;
      entrepreneurs: number;
    };
    revenue: number;
  };
  growth: {
    sessions: string;
    goals: string;
    participants: string;
    revenue: string;
  };
}

async function fetchStats(url: string) {
  const response = await axios.get<Stats>(url, { withCredentials: true });
  return response.data;
}

export default function ManagerDashboard() {
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<Stats>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${selectedOrganization.role}/dashboard/${organizationId}`
      : null,
    fetchStats,
    {
      revalidateOnFocus: false,
    }
  );
  if (isOrgLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Loading organization data...
            </p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>
        </div>
        {!isLoading && stats && <ManagerCharts stats={stats} />}
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
                value={stats?.totals.sessions.total ?? 0}
                icon="sessions"
              />
              <StatsCard
                title="Active Goals"
                value={stats?.totals.goals.total ?? 0}
                icon="goals"
              />
              <StatsCard
                title="Total Revenue"
                value={stats?.totals.revenue ?? 0}
                icon="payments"
              />
            </>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}
