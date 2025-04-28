// src/pages/Login.tsx
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles = ["manager", "coach", "entrepreneur"];

const Login = () => {
  const { login } = useAuth();
  const [role, setRole] = useState<string>("manager");

  const handleLogin = () => {
    login({ role });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-950">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            StartupSquare Login
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Select Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" onClick={handleLogin}>
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
