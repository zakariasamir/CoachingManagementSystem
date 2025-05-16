import useSWR from "swr";
import axios from "axios";

export interface User {
  userId: string; // Changed from _id to userId
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "coach" | "entrepreneur";
  organizations: {
    id: string;
    name: string;
    role: string;
    isSelected: boolean;
  };
}

interface AuthResponse {
  user: User | null;
}

const fetcher = async (url: string) => {
  try {
    const response = await axios.get<AuthResponse>(url, {
      withCredentials: true,
    });
    console.log("Auth response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return { user: null };
  }
};

// Move this inside the hook to make it dynamic
// const getStoredOrDefaultOrgId = (organizations: User["organizations"] = []) => {
//   // WARNING: localStorage is not available on the server in Next.js
//   const storedOrgId =
//     typeof window !== "undefined"
//       ? localStorage.getItem("currentOrganizationId")
//       : null;
//   if (storedOrgId) return storedOrgId;

//   // If no stored org but we have organizations, set the first one as default
//   if (organizations.length > 0 && typeof window !== "undefined") {
//     localStorage.setItem("currentOrganizationId", organizations[0].id);
//     return organizations[0].id;
//   }

//   return null;
// };

export function useAuth() {
  // Initial fetch without orgId to get user data
  const { data, error, mutate, isLoading } = useSWR<AuthResponse>(
    `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/check-auth-status`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Get orgId after initial fetch
  // const orgId = getStoredOrDefaultOrgId(initialData?.user?.organizations);

  // Main auth data fetch with orgId
  // const { data, error, mutate } = useSWR<AuthResponse>(
  //   orgId
  //     ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/check-auth-status?organizationId=${orgId}`
  //     : null,
  //   fetcher,
  //   {
  //     revalidateOnFocus: false,
  //     shouldRetryOnError: false,
  //     onSuccess: (data) => {
  //       if (data?.user) {
  //         const selectedOrg = data.user.organizations.find(
  //           (org) => org.id === orgId
  //         );
  //         if (selectedOrg) {
  //           data.user.organizations = [
  //             selectedOrg,
  //             ...data.user.organizations.filter((org) => org.id !== orgId),
  //           ];
  //         }
  //       }
  //       return data;
  //     },
  //   }
  // );

  return {
    user: data?.user || null,
    error,
    mutate,
    isLoading,
    isAuthenticated: !!(data?.user || null),
  };
}

//------------------------------------------------------------------

// import useSWR from "swr";
// import axios from "axios";

// export interface User {
//   userId: string;
//   firstName: string;
//   lastName: string;
//   email: string;
// }

// interface Organization {
//   id: string;
//   name: string;
//   role: string;
//   isSelected: boolean;
// }

// interface AuthResponse {
//   user: User | null;
//   organization: Organization | null;
// }

// const fetcher = async (url: string) => {
//   try {
//     const response = await axios.get<AuthResponse>(url, {
//       withCredentials: true,
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching auth status:", error);
//     return { user: null, organization: null };
//   }
// };

// export function useAuth() {
//   const { data, error, mutate } = useSWR<AuthResponse>(
//     `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/check-auth-status`,
//     fetcher,
//     {
//       revalidateOnFocus: false,
//       shouldRetryOnError: false,
//     }
//   );

//   return {
//     user: data?.user || null,
//     organization: data?.organization || null,
//     error,
//     mutate,
//     isLoading: !error && !data,
//     isAuthenticated: !!data?.user,
//   };
// }
