"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, DonutChart } from "@mantine/charts";

const chartColors = {
  sessions: "#3B82F6",
  goals: "#10B981",
  completed: "#34D399",
  inProgress: "#FBBF24",
  upcoming: "#60A5FA",
};

interface EntrepreneurStats {
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

export function EntrepreneurCharts({ stats }: { stats: EntrepreneurStats }) {
  const lineChartData = stats.monthlyData.map(data => ({
    month: data.month,
    sessions: data.sessions.total,
    goals: data.goals.total
  }));

  const sessionDonutData = [
    {
      name: "Completed",
      value: stats.totals.sessions.completed,
      color: chartColors.completed
    },
    {
      name: "Upcoming",
      value: stats.totals.sessions.upcoming,
      color: chartColors.upcoming
    }
  ].filter(item => item.value > 0);

  const goalsDonutData = [
    {
      name: "Completed",
      value: stats.totals.goals.completed,
      color: chartColors.completed
    },
    {
      name: "In Progress",
      value: stats.totals.goals.inProgress,
      color: chartColors.inProgress
    }
  ].filter(item => item.value > 0);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Activity Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Last 6 months performance</p>
        </CardHeader>
        <CardContent>
          <LineChart
            h={350}
            data={lineChartData}
            dataKey="month"
            series={[
              { name: "sessions", color: chartColors.sessions, label: "Sessions" },
              { name: "goals", color: chartColors.goals, label: "Goals" }
            ]}
            curveType="monotone"
            withDots
            dotProps={{ r: 4, strokeWidth: 2 }}
            strokeWidth={2}
            withLegend
            withTooltip
            yAxisProps={{ tickCount: 5 }}
          />
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Completion Rates</CardTitle>
          <p className="text-sm text-muted-foreground">Current status overview</p>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-8">
            {sessionDonutData.length > 0 && (
              <div className="flex flex-col items-center">
                <DonutChart
                  data={sessionDonutData}
                  h={350}
                  tooltipDataSource="segment"
                  withLabels
                  withTooltip
                  chartLabel="Sessions"
                  size={150}
                  thickness={40}
                />
                <div className="mt-4 space-y-2">
                  {sessionDonutData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {goalsDonutData.length > 0 && (
              <div className="flex flex-col items-center">
                <DonutChart
                  data={goalsDonutData}
                  h={350}
                  tooltipDataSource="segment"
                  withLabels
                  withTooltip
                  chartLabel="Goals"
                  size={150}
                  thickness={40}
                />
                <div className="mt-4 space-y-2">
                  {goalsDonutData.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
