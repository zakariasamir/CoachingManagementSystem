import { StatsCard } from "@/components/StatsCard";

export default function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Sessions" value={12} icon="sessions" />
        <StatsCard title="Active Goals" value={7} icon="goals" />
        <StatsCard title="Payments" value={5} icon="payments" />
      </div>

      {/* Other dashboard content here */}
    </div>
  );
}
