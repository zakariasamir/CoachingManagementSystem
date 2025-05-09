import useSWR from "swr";
import axios from "axios";

export interface User {
  id: string;
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
    return response.data;
  } catch (error) {
    return { user: null };
  }
};

export function useAuth() {
  const { data, error, mutate } = useSWR<AuthResponse>(
    `${import.meta.env.VITE_BASE_URL}/auth/check-auth-status`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data,
    error,
    mutate,
    isLoading: !error && !data,
    isAuthenticated: !!data?.user,
  };
}
