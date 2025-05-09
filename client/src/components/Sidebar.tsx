import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Flag, CreditCard, Sun, Moon, X } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
// import axios from "axios";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { data } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!data?.user) {
    navigate("/login");
  }
  const role = data?.user?.role;
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsOpen((prev) => !prev);
    document.addEventListener("toggle-sidebar", handler);
    return () => document.removeEventListener("toggle-sidebar", handler);
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      path: `/${role}/dashboard`,
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Sessions",
      path: `/${role}/sessions`,
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      name: "Goals",
      path: `/${role}/goals`,
      icon: <Flag className="h-5 w-5" />,
    },
    ...(role === "manager"
      ? [
          {
            name: "Payments",
            path: "/manager/payments",
            icon: <CreditCard className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="h-full border-r flex flex-col justify-between bg-background">
        <div>
          <div className="p-4 border-b flex justify-between items-center lg:hidden">
            <span className="font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
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
      {/* {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )} */}
    </div>
  );
};

export default Sidebar;
