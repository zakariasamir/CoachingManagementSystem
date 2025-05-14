import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Calendar,
  Flag,
  CreditCard,
  Sun,
  Moon,
  X,
  Building,
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
// import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();
  const {
    currentOrganization,
    organizations,
    organizationRole,
    switchOrganization,
  } = useOrganization();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: `/${organizationRole}/dashboard`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Sessions",
      path: `/${organizationRole}/sessions`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Goals",
      path: `/${organizationRole}/goals`,
      icon: <Flag className="h-5 w-5" />,
    },
    ...(organizationRole === "manager"
      ? [
          {
            name: "Payments",
            path: "/manager/payments",
            icon: <CreditCard className="h-5 w-5" />,
          },
          {
            name: "Users",
            path: "/manager/users",
            icon: <Flag className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  const handleOrganizationChange = async (orgId: string) => {
    try {
      await switchOrganization(orgId);

      // Get the new organization role
      const newOrg = organizations.find((org) => org.id === orgId);
      if (newOrg) {
        const newPath = `/${newOrg.role}/dashboard`;
        navigate(newPath);
      }
    } catch (error) {
      console.error("Failed to switch organization:", error);
    }
  };

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    document.addEventListener("toggle-sidebar", handler);
    return () => document.removeEventListener("toggle-sidebar", handler);
  }, []);

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
              <label className="text-sm font-medium">Organization</label>
              <Select
                value={currentOrganization?.id}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select organization" />
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
                to={item.path}
                onClick={() => setIsOpen(false)}
              >
                <Button
                  variant={
                    location.pathname === item.path ? "secondary" : "ghost"
                  }
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
