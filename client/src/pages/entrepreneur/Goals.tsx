import { GoalCard } from "@/components/GoalCard";
import { Skeleton } from "@/components/ui/skeleton";
// import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import useSWR from "swr";
import axios from "axios";

interface Goal {
  _id: string;
  title: string;
  description: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  coachId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

async function fetchGoals(url: string) {
  const response = await axios.get<Goal[]>(url, { withCredentials: true });
  return response.data;
}

export default function EntrepreneurGoals() {
  // const { data } = useAuth();
  const { currentOrganization } = useOrganization();
  const organizationId = currentOrganization?.id;
  const { data: goals, error } = useSWR(
    organizationId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/entrepreneur/goals?organizationId=${organizationId}`
      : null,
    fetchGoals
  );

  if (error) return <div className="p-6">Failed to load goals</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Goals</h1>
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
          goals.map((goal) => <GoalCard key={goal._id} goal={goal} />)
        )}
      </div>
    </div>
  );
}
