import { StatsCard } from "@/components/StatsCard";

export default function ManagerDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard title="Total Sessions" value={12} icon="sessions" />
      <StatsCard title="Active Goals" value={7} icon="goals" />
    </div>
  );
}
