import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const CoachLayout = ({ children }: any) => {
  const { user, isLoading } = useAuth();
  const { selectedOrganization, isLoading: isOrgLoading } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user && router.pathname !== '/auth/login') {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || isOrgLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-8 space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default CoachLayout;
