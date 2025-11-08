"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout } from "@/hooks/use-logout";
import { useAuthStore } from "@/stores/auth.store";
import {
  Bell,
  Calendar,
  MoonIcon,
  Settings,
  SunIcon,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { WiSunrise } from "react-icons/wi";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggler } from "./ThemeToggler";
import { getUserRole } from "@/utils/helpers/user";

export function DashboardHeader() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute (instead of every second for better performance)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const { greeting, greetingIcon, formattedDate, formattedTime } =
    useMemo(() => {
      const currentHour = currentTime.getHours();
      let greeting: string;
      let greetingIcon: React.ReactNode;

      if (currentHour < 12) {
        greeting = "morning";
        greetingIcon = <WiSunrise size={20} className="text-amber-500" />;
      } else if (currentHour < 17) {
        greeting = "afternoon";
        greetingIcon = <SunIcon size={18} className="text-amber-400" />;
      } else {
        greeting = "evening";
        greetingIcon = <MoonIcon size={18} className="text-indigo-400" />;
      }

      const formattedDate = currentTime.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      const formattedTime = currentTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        greeting,
        greetingIcon,
        formattedDate,
        formattedTime,
      };
    }, [currentTime]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const userRole = getUserRole(user);

  return (
    <header className="border-b bg-background">
      <div className="w-full px-4 flex h-16 items-center justify-between gap-4">
        <div>
          <SidebarTrigger className="cursor-pointer" />
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          {/* Date/Time Info - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {greetingIcon}
              <span>
                Good {greeting},{" "}
                <span className="font-medium">{user?.firstName}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={16} className="text-muted-foreground" />
              <span>{formattedDate}</span>
              <span className="mx-1">•</span>
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Notifications and user menu */}
          <div className="flex items-center gap-2">
            <ThemeToggler />

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full cursor-pointer"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full cursor-pointer"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar?.url}
                      alt={user?.firstName}
                    />
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                      {getInitials(user?.firstName || "", user?.lastName || "")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <Badge
                      variant="secondary"
                      className="mt-1 capitalize w-fit"
                    >
                      {userRole}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
