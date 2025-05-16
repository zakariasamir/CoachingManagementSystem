import { StatsCard } from "@/components/StatsCard";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import axios from "axios";
import CoachLayout from "@/layouts/CoachLayouts";

interface DashboardStats {
  totalSessions: number;
  completedSessions: number;
  totalGoals: number;
}

async function fetchStats(url: string) {
  const response = await axios.get<DashboardStats>(url, {
    withCredentials: true,
  });
  return response.data;
}

export default function CoachDashboard() {
  const { data: stats, error } = useSWR(
    `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/dashboard`,
    fetchStats
  );

  if (error) return <div className="p-6">Failed to load dashboard stats</div>;

  return (
    <CoachLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {!stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              icon="sessions"
            />
            <StatsCard
              title="Active Goals"
              value={stats.totalGoals}
              icon="goals"
            />
            <StatsCard
              title="Completed Sessions"
              value={stats.completedSessions}
              icon="check"
            />
          </div>
        )}
      </div>
    </CoachLayout>
  );
}
