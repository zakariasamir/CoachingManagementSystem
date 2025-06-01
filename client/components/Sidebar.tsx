import Link from "next/link";
import { useRouter } from "next/router";
import {
  Home,
  Calendar,
  Flag,
  CreditCard,
  Sun,
  Moon,
  X,
  Building,
  Loader2,
  File,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/hooks/useOrganization";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

const Sidebar = () => {
  const router = useRouter();
  const {
    organizations,
    selectedOrganization,
    switchOrganization,
    isLoading: isOrgLoading,
    error: orgError,
  } = useOrganization();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { pathname } = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Handle authentication check
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const menuItems = [
    ...(selectedOrganization?.role === "manager"
      ? [
          {
            name: "Dashboard",
            path: "/manager/dashboard",
            icon: <Home className="h-5 w-5" />,
          },
          {
            name: "Sessions",
            path: "/manager/sessions",
            icon: <Calendar className="h-5 w-5" />,
          },
          // {
          //   name: "Payments",
          //   path: "/manager/payments",
          //   icon: <CreditCard className="h-5 w-5" />,
          // },
          {
            name: "Users",
            path: "/manager/users",
            icon: <Flag className="h-5 w-5" />,
          },
          {
            name: "Invoices",
            path: "/manager/invoices",
            icon: <File className="h-5 w-5" />,
          },
        ]
      : []),
    ...(selectedOrganization?.role === "coach"
      ? [
          {
            name: "Dashboard",
            path: "/coach/dashboard",
            icon: <Home className="h-5 w-5" />,
          },
          {
            name: "Sessions",
            path: "/coach/sessions",
            icon: <Calendar className="h-5 w-5" />,
          },
          {
            name: "Sessions Request",
            path: "/coach/sessionRequest",
            icon: <Calendar className="h-5 w-5" />,
          },
          {
            name: "Invoices",
            path: "/coach/invoices",
            icon: <File className="h-5 w-5" />,
          },
        ]
      : []),
    ...(selectedOrganization?.role === "entrepreneur"
      ? [
          {
            name: "Dashboard",
            path: "/entrepreneur/dashboard",
            icon: <Home className="h-5 w-5" />,
          },
          {
            name: "Sessions",
            path: "/entrepreneur/sessions",
            icon: <Calendar className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  const handleOrganizationChange = async (orgId: string) => {
    try {
      // Find the organization we're switching to before making the API call
      const targetOrg = organizations.find((org) => org.id === orgId);
      if (!targetOrg) {
        console.error("Organization not found");
        return;
      }

      // Switch organization
      await switchOrganization(orgId);

      // Use the target organization's role for navigation
      const newPath = `/${targetOrg.role}/dashboard`;
      router.push(newPath);
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    document.addEventListener("toggle-sidebar", handler);
    return () => document.removeEventListener("toggle-sidebar", handler);
  }, []);

  // Early return with loading state for both auth and org loading
  if (isAuthLoading || isOrgLoading) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Loading...</h2>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Early return if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Early return with error state
  if (orgError) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background">
        <div className="p-4 border-b">
          <div className="text-destructive">
            <h2 className="font-semibold">Error</h2>
            <p className="text-sm">
              {orgError.message || "Failed to load organizations"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="h-full border-r flex flex-col justify-between bg-background">
        <div>
          <div className="p-4 border-b flex flex-col gap-4">
            <div className="flex justify-between items-center lg:hidden">
              <span className="font-semibold">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Organization Switcher */}
            <div className="space-y-2">
              {/* <label className="text-sm font-medium">Organization</label> */}
              <Select
                value={selectedOrganization?.id}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization">
                    {selectedOrganization?.name || "Select organization"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{org.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {org.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  // as="div"
                  variant={pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  {item.icon}
                  <span className="truncate">{item.name}</span>
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t flex justify-between items-center">
          <span className="text-sm">Theme</span>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
