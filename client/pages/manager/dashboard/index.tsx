import { StatsCard } from "@/components/StatsCard";
import useSWR from "swr";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganization } from "@/hooks/useOrganization";
import ManagerLayout from "@/layouts/ManagerLayout";
import { Loader2 } from "lucide-react";

interface Stats {
  totalSessions: number;
  totalGoals: number;
  payments: number;
}

async function fetchStats(url: string) {
  // if (!url) return null;
  const response = await axios.get<Stats>(url, { withCredentials: true });
  return response.data;
}

export default function ManagerDashboard() {
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const organizationId = selectedOrganization?.id;

  const {
    data: stats,
    error,
    isLoading,
  } = useSWR<Stats>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${selectedOrganization.role}/dashboard?organizationId=${organizationId}`
      : null,
    fetchStats,
    {
      revalidateOnFocus: false,
    }
  );
  if (isOrgLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading organization data...</p>
          </div>
        </div>
      </ManagerLayout>
    );
  }

  // if (error) {
  //   return (
  //     <div className="p-4 text-red-500">
  //       Failed to load stats. Please try again later.
  //     </div>
  //   );
  // }

  return (
    <ManagerLayout>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32 hidden sm:block" />
              <Skeleton className="h-32 hidden lg:block" />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Sessions"
                value={stats?.totalSessions ?? 0}
                icon="sessions"
              />
              <StatsCard
                title="Active Goals"
                value={stats?.totalGoals ?? 0}
                icon="goals"
              />
              <StatsCard
                title="Payments"
                value={stats?.payments ?? 0}
                icon="payments"
              />
            </>
          )}
        </div>
      </div>
    </ManagerLayout>
  );
}

//-------------------------------------------

// import { StatsCard } from "@/components/StatsCard";
// import useSWR from "swr";
// import axios from "axios";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useOrganization } from "@/hooks/useOrganization";
// import ManagerLayout from "@/layouts/ManagerLayout";
// import { Loader2 } from "lucide-react";

// interface Stats {
//   totalSessions: number;
//   totalGoals: number;
//   payments: number;
// }

// async function fetchStats(url: string) {
//   if (!url) return null;
//   const response = await axios.get<Stats>(url, { withCredentials: true });
//   return response.data;
// }

// export default function ManagerDashboard() {
//   const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();

//   // Always call useSWR, but pass null if no organizationId
//   const {
//     data: stats,
//     error,
//     isLoading,
//   } = useSWR<Stats>(
//     selectedOrganization
//       ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/manager/dashboard?organizationId=${selectedOrganization.id}`
//       : null,
//     fetchStats,
//     {
//       revalidateOnFocus: false,
//     }
//   );

//   // Render loading state for organization
//   if (isOrgLoading) {
//     return (
//       <ManagerLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             <p className="text-muted-foreground">Loading organization data...</p>
//           </div>
//         </div>
//       </ManagerLayout>
//     );
//   }

//   // Render no organization selected state
//   if (!selectedOrganization) {
//     return (
//       <ManagerLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="text-center max-w-md mx-auto p-6">
//             <h2 className="text-xl font-semibold mb-2">No Organization Selected</h2>
//             <p className="text-muted-foreground">
//               Please select an organization from the sidebar to view the dashboard.
//             </p>
//           </div>
//         </div>
//       </ManagerLayout>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <ManagerLayout>
//         <div className="p-6">
//           <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
//             <h2 className="font-semibold mb-2">Error Loading Dashboard</h2>
//             <p>{error.message || "Failed to load stats. Please try again later."}</p>
//           </div>
//         </div>
//       </ManagerLayout>
//     );
//   }

//   // Render main dashboard
//   return (
//     <ManagerLayout>
//       <div className="space-y-6 p-4 lg:p-6">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <h1 className="text-xl sm:text-2xl font-bold">
//             {selectedOrganization.name} - Dashboard Overview
//           </h1>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {isLoading ? (
//             <>
//               <Skeleton className="h-32" />
//               <Skeleton className="h-32 hidden sm:block" />
//               <Skeleton className="h-32 hidden lg:block" />
//             </>
//           ) : (
//             <>
//               <StatsCard
//                 title="Total Sessions"
//                 value={stats?.totalSessions ?? 0}
//                 icon="sessions"
//               />
//               <StatsCard
//                 title="Active Goals"
//                 value={stats?.totalGoals ?? 0}
//                 icon="goals"
//               />
//               <StatsCard
//                 title="Payments"
//                 value={stats?.payments ?? 0}
//                 icon="payments"
//               />
//             </>
//           )}
//         </div>
//       </div>
//     </ManagerLayout>
//   );
// }
