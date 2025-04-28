import { GoalCard } from "@/components/GoalCard";
import { goals } from "@/data/fakeData";

export default function EntrepreneurGoals() {
  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Your Goals</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </div>
  );
}
