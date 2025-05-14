import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSWRMutation from "swr/mutation";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/Icons";
// import { useOrganization } from "@/hooks/useOrganization";
import { cn } from "@/lib/utils";
import { mutate } from "swr";

interface LoginResponse {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    organizations: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
  message: string;
}

async function loginRequest(
  url: string,
  { arg }: { arg: { email: string; password: string } }
) {
  const response = await axios.post<LoginResponse>(url, arg, {
    withCredentials: true,
  });
  return response.data;
}

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const { trigger, isMutating, error } = useSWRMutation(
    `${import.meta.env.VITE_BASE_URL}/auth/login`,
    loginRequest,
    {
      onSuccess: async (data) => {
        // Set the first organization as default if exists
        if (data.user.organizations.length > 0) {
          const organizations = data.user.organizations;
          const defaultOrg = localStorage.getItem("currentOrganizationId");
          const selectedOrg = organizations.find(
            (org) => org.id === defaultOrg
          );
          if (selectedOrg) {
            console.log("Selected organization:", selectedOrg);
            navigate(`/${selectedOrg.role}/dashboard`);
          }
          // Store the first organization ID in localStorage
          if (!defaultOrg || !selectedOrg) {
            localStorage.setItem("currentOrganizationId", organizations[0].id);
            navigate(`/${organizations[0].role}/dashboard`);
          }
        }
        // Mutate the auth state to update the user data
        await mutate("/auth/check-auth-status");
      },
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await trigger(credentials);
      mutate("/auth", userData, false);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-[400px] shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center font-bold">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={credentials.email}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600 dark:bg-red-900/50 dark:border-red-800 dark:text-red-400">
                {error instanceof Error
                  ? "Invalid email or password"
                  : "Login failed"}
              </div>
            )}

            <Button
              type="submit"
              className={cn(
                "w-full",
                isMutating && "opacity-50 cursor-not-allowed"
              )}
              disabled={isMutating}
            >
              {isMutating && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 text-primary hover:underline"
                onClick={() => navigate("/register")}
              >
                Sign up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
