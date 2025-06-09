import { useRouter } from "next/router";
import useSWRMutation from "swr/mutation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect } from "react";

async function logoutRequest(url: string) {
  await axios.post(url, {}, { withCredentials: true });
}

const Navbar = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, router, isLoading]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const { trigger: logout, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/auth/logout`,
    logoutRequest,
    {
      onSuccess: () => {
        router.push("/auth/login");
      },
      onError: (error) => {
        console.error("Logout failed:", error);
      },
    }
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) {
    return null;
  }

  const { firstName, lastName } = user;

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="lg:hidden"
          onClick={() => document.dispatchEvent(new Event("toggle-sidebar"))}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="text-base sm:text-lg font-semibold truncate">
          Welcome,{" "}
          <span className="hidden sm:inline">
            {firstName} {lastName}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isMutating}>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage
                alt={`${firstName} ${lastName}`}
              />
              <AvatarFallback>
                {getInitials(firstName, lastName)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem className="font-bold text-lg">
              {firstName} {lastName}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/profile"
                className="flex w-full items-center"
                legacyBehavior
              >
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
              disabled={isMutating}
              className="flex items-center gap-2"
            >
              {isMutating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                "Logout"
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
export default Navbar;
