"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, DonutChart } from "@mantine/charts";
import { TrendingUp, TrendingDown } from "lucide-react";

const chartColors = {
  sessions: "#3B82F6",
  goals: "#10B981",
  users: "#8B5CF6",
  completed: "#34D399",
  inProgress: "#FBBF24",
  upcoming: "#60A5FA",
};

interface ManagerStats {
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

export function ManagerCharts({ stats }: { stats: ManagerStats }) {
  // Format monthly revenue data
  const lineChartData = stats.monthlyData.map((data, index, array) => {
    return {
      month: data.month,
      sessions: data.sessions.total || 0,
      goals: data.goals.total || 0,
      users: data.participants.total || 0,
    };
  });

  // Format growth data with proper number conversion
  const growthData = Object.entries(stats.growth).map(([key, value]) => {
    const numericValue = parseFloat(value);

    return {
      key,
      value: numericValue,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    };
  });

  const sessionDonutData = [
    {
      name: "Completed",
      value: stats.totals.sessions.completed || 0,
      color: chartColors.completed,
    },
    {
      name: "Upcoming",
      value: stats.totals.sessions.upcoming || 0,
      color: chartColors.upcoming,
    },
  ].filter((item) => item.value > 0);

  const goalsDonutData = [
    {
      name: "Completed",
      value: stats.totals.goals?.completed || 0,
      color: chartColors.completed,
    },
    {
      name: "In Progress",
      value: stats.totals.goals?.inProgress || 0,
      color: chartColors.inProgress,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Activity Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Last 6 months performance
          </p>
        </CardHeader>
        <CardContent>
          <LineChart
            h={350}
            data={lineChartData}
            dataKey="month"
            series={[
              {
                name: "sessions",
                color: chartColors.sessions,
                label: "Sessions",
              },
              { name: "goals", color: chartColors.goals, label: "Goals" },
              { name: "users", color: chartColors.users, label: "Users" },
            ]}
            curveType="monotone"
            withDots
            dotProps={{ r: 4, strokeWidth: 2 }}
            strokeWidth={2}
            withLegend
            withTooltip
            gridProps={{
              strokeDasharray: "0",
              horizontal: true,
              vertical: true,
            }}
            yAxisProps={{
              tickCount: 5,
              width: 60,
            }}
          />
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {growthData.map(({ key, value, label }) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/10"
              >
                {value >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className="text-sm font-medium capitalize">
                  {label}: {value >= 0 ? "+" : ""}
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Completion Rates
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Current status overview
          </p>
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
                  tooltipProps={{
                    content: ({ payload }) => (
                      <div className="bg-card p-2 rounded-lg shadow-lg">
                        <p className="font-medium">{payload?.[0]?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload?.[0]?.value} sessions
                        </p>
                      </div>
                    ),
                  }}
                />
                <div className="mt-4 space-y-2">
                  {sessionDonutData.map((item) => (
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
                  tooltipProps={{
                    content: ({ payload }) => (
                      <div className="bg-card p-2 rounded-lg shadow-lg">
                        <p className="font-medium">{payload?.[0]?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload?.[0]?.value} goals
                        </p>
                      </div>
                    ),
                  }}
                />
                <div className="mt-4 space-y-2">
                  {goalsDonutData.map((item) => (
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
