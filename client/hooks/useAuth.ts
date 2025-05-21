import useSWR from "swr";
import axios from "axios";

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "manager" | "coach" | "entrepreneur";
  organizations: {
    id: string;
    name: string;
    role: string;
    selected: boolean;
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
    return response.data;
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return { user: null };
  }
};

export function useAuth() {
  const { data, error, mutate, isLoading } = useSWR<AuthResponse>(
    `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/check-auth-status`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      revalidateOnMount: true,
    }
  );

  return {
    user: data?.user || null,
    error,
    mutate,
    isLoading,
    isAuthenticated: !!(data?.user || null),
  };
}
