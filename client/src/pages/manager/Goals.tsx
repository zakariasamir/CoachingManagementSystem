import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
// import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { GoalCard } from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GoalForm from "@/components/forms/GoalForm";
import { toast } from "sonner";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Goal {
  _id: string;
  title: string;
  description: string;
  status: "not_started" | "in_progress" | "completed";
  progress: number;
  entrepreneurId: User;
  coachId: User;
  organizationId: string;
  createdAt: string;
}

async function fetchGoals(url: string) {
  const response = await axios.get<Goal[]>(url, { withCredentials: true });
  return response.data;
}

export default function ManagerGoals() {
  const [isGoalFormOpen, setGoalFormOpen] = useState(false);
  // const { data: authData } = useAuth();
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;

  const {
    data: goals,
    error,
    mutate,
  } = useSWR(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/manager/goals?organizationId=${organizationId}`
      : null,
    fetchGoals
  );

  const handleAddGoal = async (goalData: Omit<Goal, "_id" | "createdAt">) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/manager/goals`,
        { ...goalData, organizationId },
        { withCredentials: true }
      );

      await mutate();
      setGoalFormOpen(false);
      toast.success("Goal created successfully");
    } catch (error) {
      toast.error("Failed to create goal");
      console.error("Error creating goal:", error);
    }
  };

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Failed to load goals. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Goals</h1>
        <Button onClick={() => setGoalFormOpen(true)}>New Goal +</Button>
      </div>

      <GoalForm
        isOpen={isGoalFormOpen}
        onClose={() => setGoalFormOpen(false)}
        onSubmit={handleAddGoal}
        organizationId={organizationId || ""}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!goals ? (
          <>
            <Skeleton className="h-[200px]" />
            <Skeleton className="h-[200px] hidden md:block" />
            <Skeleton className="h-[200px] hidden lg:block" />
          </>
        ) : goals.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-500">
            No goals found. Create your first goal!
          </div>
        ) : (
          goals.map((goal) => (
            <GoalCard key={goal._id} goal={goal} onUpdate={mutate} />
          ))
        )}
      </div>
    </div>
  );
}
