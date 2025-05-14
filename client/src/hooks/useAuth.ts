import useSWR from "swr";
import axios from "axios";

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "coach" | "entrepreneur";
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

interface AuthResponse {
  user: User | null;
}

const fetcher = async (url: string) => {
  try {
    const response = await axios.get<AuthResponse>(url, {
      withCredentials: true,
    });
    console.log("Auth response:", response.data); // Log the response data
    return response.data;
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return { user: null };
  }
};

// Move this inside the hook to make it dynamic
const getStoredOrDefaultOrgId = (organizations: User["organizations"] = []) => {
  const storedOrgId = localStorage.getItem("currentOrganizationId");
  if (storedOrgId) return storedOrgId;

  // If no stored org but we have organizations, set the first one as default
  if (organizations.length > 0) {
    localStorage.setItem("currentOrganizationId", organizations[0].id);
    return organizations[0].id;
  }

  return null;
};

export function useAuth() {
  // Initial fetch without orgId to get user data
  const { data: initialData } = useSWR<AuthResponse>(
    `${import.meta.env.VITE_BASE_URL}/auth/check-auth-status`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Get orgId after initial fetch
  const orgId = getStoredOrDefaultOrgId(initialData?.user?.organizations);

  // Main auth data fetch with orgId
  const { data, error, mutate } = useSWR<AuthResponse>(
    orgId
      ? `${
          import.meta.env.VITE_BASE_URL
        }/auth/check-auth-status?organizationId=${orgId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (data?.user) {
          const selectedOrg = data.user.organizations.find(
            (org) => org.id === orgId
          );
          if (selectedOrg) {
            data.user.organizations = [
              selectedOrg,
              ...data.user.organizations.filter((org) => org.id !== orgId),
            ];
          }
        }
        return data;
      },
    }
  );

  return {
    user: data?.user || initialData?.user,
    error,
    mutate,
    isLoading: !error && !data && !initialData,
    isAuthenticated: !!(data?.user || initialData?.user),
  };
}
