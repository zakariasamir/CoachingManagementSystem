export interface ManagerStats {
  monthlyData: Array<{
    month: string;
    sessions: number;
    completedSessions: number;
    goals: number;
    completedGoals: number;
    payments: number;
    revenue: number;
    activeCoaches: number;
    activeEntrepreneurs: number;
  }>;
  totals: {
    sessions: number;
    completedSessions: number;
    goals: number;
    completedGoals: number;
    payments: number;
    revenue: number;
    coaches: number;
    entrepreneurs: number;
    sessionParticipants: number;
  };
  growth: {
    sessions: string;
    goals: string;
    revenue: string;
    coaches: string;
    entrepreneurs: string;
  };
}
