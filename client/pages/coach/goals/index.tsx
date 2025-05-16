import { GoalCard } from "@/components/GoalCard";
import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import CoachLayout from "@/layouts/CoachLayouts";

interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  entrepreneurId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
  coachId: string;
  updates: Array<{
    updatedBy: string;
    content: string;
    timestamp: string;
  }>;
  createdAt: string;
}

async function fetchGoals(url: string) {
  const response = await axios.get<Goal[]>(url, { withCredentials: true });
  return response.data;
}

export default function CoachGoals() {
  const {
    data: goals,
    error,
    mutate,
  } = useSWR(
    `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/goals`,
    fetchGoals
  );

  const handleProgressUpdate = async (goalId: string, progress: number) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/goals/${goalId}`,
        {
          progress,
          // Status will be updated automatically by the backend
        },
        { withCredentials: true }
      );
      await mutate();
      toast.success("Goal progress updated");
    } catch (error) {
      toast.error("Failed to update goal progress");
      console.error("Error updating goal:", error);
    }
  };

  if (error) return <div className="p-6">Failed to load goals</div>;

  return (
    <CoachLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Coach Goals</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!goals ? (
            <>
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[200px] hidden md:block" />
              <Skeleton className="h-[200px] hidden lg:block" />
            </>
          ) : goals.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No goals found
            </div>
          ) : (
            goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onProgressUpdate={(progress: number) =>
                  handleProgressUpdate(goal._id, progress)
                }
              />
            ))
          )}
        </div>
      </div>
    </CoachLayout>
  );
}
