// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import { useState } from "react";
// import { useAuth } from "@/hooks/useAuth";

// interface GoalCardProps {
//   goal: {
//     _id: string;
//     title: string;
//     description: string;
//     progress: number;
//     status: "not-started" | "in-progress" | "completed";
//     entrepreneurId: {
//       _id: string;
//       firstName: string;
//       lastName: string;
//       email: string;
//     };
//     organizationId: string;
//     coachId: {
//       _id: string;
//       firstName: string;
//       lastName: string;
//       email: string;
//     };
//     updates: Array<{
//       updatedBy?: string; // Make optional as it's not always present
//       content?: string; // Make optional as it's not always present
//       timestamp?: string; // Make optional as it's not always present
//     }>;
//     createdAt: string;
//     __v: number;
//   };
//   onProgressUpdate?: (progress: number) => Promise<void>;
// }

// export function GoalCard({ goal, onProgressUpdate }: GoalCardProps) {
//   const { user } = useAuth();
//   const isCoach = user?.organizations.role === "coach";

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "completed":
//         return "text-green-600";
//       case "in-progress":
//         return "text-blue-600";
//       default:
//         return "text-gray-600";
//     }
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>{goal.title}</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <p className="text-gray-500">
//           Entrepreneur: {goal.entrepreneurId.firstName}{" "}
//           {goal.entrepreneurId.lastName}
//         </p>
//         <p className={`text-sm font-medium ${getStatusColor(goal.status)}`}>
//           Status: {goal.status.replace("-", " ").toUpperCase()}
//         </p>
//         <p className="text-sm">{goal.description}</p>

//         <div className="space-y-2">
//           <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
//             <div
//               className="bg-primary h-2.5 rounded-full transition-all"
//               style={{ width: `${goal.progress}%` }}
//             />
//           </div>
//           <p className="text-right text-xs text-gray-500">
//             {goal.progress}% Complete
//           </p>
//         </div>

//         {goal.updates.length > 0 && (
//           <div className="space-y-2 border-t pt-4">
//             <h4 className="text-sm font-medium">Updates History</h4>
//             <div className="space-y-3">
//               {goal.updates.map((update, index) => (
//                 <div
//                   key={index}
//                   className="text-sm space-y-1 p-2 bg-muted rounded-md"
//                 >
//                   <p className="text-xs text-muted-foreground">
//                     {new Date(update.timestamp || "").toLocaleDateString()}
//                   </p>
//                   <p>{update.content}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { GoalDrawer } from "./GoalDrawer";

interface GoalCardProps {
  goal: {
    _id: string;
    title: string;
    description: string;
    progress: number;
    status: "not-started" | "in-progress" | "completed";
    entrepreneurId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    organizationId: string;
    coachId: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    updates: Array<{
      updatedBy?: string;
      content?: string;
      timestamp?: string;
    }>;
    createdAt: string;
    __v: number;
  };
  onProgressUpdate?: (progress: number) => Promise<void>;
}

export function GoalCard({ goal, onProgressUpdate }: GoalCardProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const handleGoalUpdate = async (
  //   goalId: string,
  //   progress: number,
  //   note: string
  // ) => {
  //   try {
  //     await axios.patch(
  //       `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/coach/goals/${goalId}`,
  //       {
  //         progress,
  //         update: {
  //           content: note,
  //         },
  //       },
  //       { withCredentials: true }
  //     );
  //     await mutate();
  //     toast.success("Goal updated successfully");
  //   } catch (error) {
  //     toast.error("Failed to update goal");
  //     throw error;
  //   }
  // };

  return (
    <>
      <Card
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsDrawerOpen(true)}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold truncate">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">
                {goal.entrepreneurId.firstName} {goal.entrepreneurId.lastName}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">
                {goal.progress}% Complete
              </p>
            </div>
          </div>
          {/* <UpdateGoalDialog goal={goal} onProgressUpdate={handleGoalUpdate} /> */}
        </CardContent>
      </Card>

      <GoalDrawer
        goal={goal}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
