// src/components/Sidebar.tsx
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Shadcn utility
import { Button } from "@/components/ui/button";

const links = [
  { to: "/entrepreneur/dashboard", label: "Dashboard" },
  { to: "/entrepreneur/goals", label: "Goals" },
];

export const Sidebar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden p-2">
        <Button variant="outline" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed z-30 inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 md:translate-x-0 transform transition-transform",
          open ? "translate-x-0" : "-translate-x-full",
          "md:relative md:flex md:flex-col md:w-64"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-primary">StartupSquare</h1>
          <button onClick={() => setOpen(false)} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-all",
                location.pathname === link.to
                  ? "bg-gray-100 dark:bg-gray-800 font-semibold"
                  : ""
              )}
            >
              {/* Icon placeholder */}
              <div className="h-5 w-5 bg-primary/20 rounded-full" />
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};
