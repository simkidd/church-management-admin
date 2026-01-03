"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogout } from "@/hooks/use-logout";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  Church,
  FileCheck,
  GraduationCap,
  Home,
  Mic,
  Settings,
  Shield,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DashboardNavUser from "./DashboardNavUser";
import { config } from "@/utils/config";
import Logo from "./Logo";

interface ISidebarMenu {
  title: string;
  url: string;
  roles: string[];
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  items?: ISidebarMenu[];
}

interface INavGroup {
  title: string;
  roles: string[];
  items: ISidebarMenu[];
}

const navGroups: INavGroup[] = [
  {
    title: "Main",
    roles: ["super-admin", "admin", "pastor", "instructor"],
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        roles: ["super-admin", "admin", "pastor", "instructor"],
        icon: Home,
      },
      // {
      //   title: "Analytics",
      //   url: "/dashboard/analytics",
      //   roles: ["super-admin", "admin"],
      //   icon: BarChart3,
      // },
    ],
  },
  {
    title: "User Management",
    roles: ["super-admin", "admin"],
    items: [
      {
        title: "All Users",
        url: "/dashboard/users",
        roles: ["super-admin", "admin"],
        icon: Users,
      },
      {
        title: "Role Management",
        url: "/dashboard/users/roles",
        roles: ["super-admin"],
        icon: Shield,
      },
    ],
  },
  {
    title: "Course Management",
    roles: ["super-admin", "admin", "instructor"],
    items: [
      {
        title: "All Courses",
        url: "/dashboard/courses",
        roles: ["super-admin", "admin", "instructor"],
        icon: BookOpen,
      },
    
    ],
  },
  
  {
    title: "Sermon Management",
    roles: ["super-admin", "admin", "pastor"],
    items: [
      {
        title: "All Sermons",
        url: "/dashboard/sermons",
        roles: ["super-admin", "admin", "pastor"],
        icon: Mic,
      },
      {
        title: "Sermon Series",
        url: "/dashboard/series",
        roles: ["super-admin", "admin", "pastor"],
        icon: Mic,
      },
      // {
      //   title: "Popular Sermons",
      //   url: "/dashboard/sermons/popular",
      //   roles: ["super-admin", "admin", "pastor"],
      //   icon: TrendingUp,
      // },
      // {
      //   title: "Sermon Analytics",
      //   url: "/dashboard/sermons/analytics",
      //   roles: ["super-admin", "admin", "pastor"],
      //   icon: BarChart3,
      // },
    ],
  },
  {
    title: "Event Management",
    roles: ["super-admin", "admin", "pastor"],
    items: [
      {
        title: "All Events",
        url: "/dashboard/events",
        roles: ["super-admin", "admin", "pastor"],
        icon: Calendar,
      },
      // {
      //   title: "My Events",
      //   url: "/dashboard/events/created",
      //   roles: ["super-admin", "admin", "pastor"],
      //   icon: User,
      // },
      // {
      //   title: "Event Registrations",
      //   url: "/dashboard/events/registrations",
      //   roles: ["super-admin", "admin", "pastor"],
      //   icon: Users,
      // },
    ],
  },
  // {
  //   title: "Appointment System",
  //   roles: ["super-admin", "admin", "pastor"],
  //   items: [
  //     {
  //       title: "Appointments",
  //       url: "/dashboard/appointments",
  //       roles: ["super-admin", "admin", "pastor"],
  //       icon: Clock,
  //     },
  //     {
  //       title: "Availability",
  //       url: "/dashboard/appointments/availability",
  //       roles: ["super-admin", "admin", "pastor"],
  //       icon: Calendar,
  //     },
  //     {
  //       title: "Booking Requests",
  //       url: "/dashboard/appointments/requests",
  //       roles: ["super-admin", "admin", "pastor"],
  //       icon: User,
  //     },
  //   ],
  // },
];

// Common navigation items for all roles (outside the groups)
const commonNav: ISidebarMenu[] = [
  {
    title: "Profile",
    url: "/dashboard/profile",
    roles: ["super-admin", "admin", "instructor", "pastor"],
    icon: User,
  },
  // {
  //   title: "Notifications",
  //   url: "/dashboard/notifications",
  //   roles: ["super-admin", "admin", "instructor", "pastor"],
  //   icon: Bell,
  // },
  {
    title: "Settings",
    url: "/dashboard/settings",
    roles: ["super-admin", "admin"],
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, hasHydrated } = useAuthStore();
  const { setOpenMobile } = useSidebar();

  const isItemActive = (itemUrl: string) => {
    if (itemUrl === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(`${itemUrl}/`) || pathname === itemUrl;
  };

  const getUserRole = (): string => {
    if (!user) return "";

    if (user.isSuperAdmin) return "super-admin";
    if (user.isAdmin) return "admin";
    if (user.isPastor) return "pastor";
    if (user.isInstructor) return "instructor";

    return "member";
  };

  const userRole = getUserRole();

  const hasAccess = (roles: string[]): boolean => {
    return roles.includes(userRole);
  };

  const filterNestedItems = (items: ISidebarMenu[]): ISidebarMenu[] => {
    return items
      .filter((item) => hasAccess(item.roles))
      .map((item) => ({
        ...item,
        items: item.items ? filterNestedItems(item.items) : undefined,
      }));
  };

  if (!hasHydrated) {
    return (
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="px-2 py-2 border-b min-h-16 flex items-center justify-center">
          <div className="flex items-center py-1">
            <Link href="/" className="flex items-center gap-2 font-medium">
              <Logo className="h-8" />
              {config.SITE_NAME}
            </Link>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <div className="p-4 space-y-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t shrink-0">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-1 flex-col space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="px-2 py-2 border-b min-h-16 flex items-center justify-center">
        <div className="flex items-center py-1">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpenMobile(false)}
          >
            <div
              className={cn(
                "aspect-square transition-all duration-200",
                "group-data-[collapsible=icon]:block",
                "group-data-[collapsible=icon]:w-8",
                "group-data-[state=expanded]:hidden",
                "hidden md:block"
              )}
            >
              <Logo className="h-8" />
            </div>
            <div
              className={cn(
                "transition-all duration-200",
                "group-data-[collapsible=icon]:hidden",
                "group-data-[state=expanded]:block"
              )}
            >
              <div className="flex items-center gap-2 font-medium text-nowrap">
                <Logo className="h-8" />
                {config.SITE_NAME}
              </div>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1 flex flex-col min-h-0">
          {/* Role-specific navigation */}
          {navGroups
            .filter((group) => hasAccess(group.roles))
            .map((group, groupIndex) => {
              const filteredItems = filterNestedItems(group.items);
              if (filteredItems.length === 0) return null;

              return (
                <SidebarGroup key={groupIndex}>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {filteredItems.map((item, i) => {
                        const Icon = item.icon;
                        return (
                          <SidebarMenuItem key={i}>
                            <SidebarMenuButton
                              asChild
                              isActive={isItemActive(item.url)}
                              className="w-full justify-start"
                              tooltip={item.title}
                              onClick={() => setOpenMobile(false)}
                            >
                              <Link
                                href={item.url}
                                className="h-full w-full flex items-center "
                              >
                                {Icon && <Icon size={18} />}
                                <span className="sidebar-collapsed:hidden">
                                  {item.title}
                                </span>
                              </Link>
                            </SidebarMenuButton>

                            {item.items && item.items.length > 0 && (
                              <div className="ml-4 mt-1 space-y-1">
                                {item.items.map((subItem) => (
                                  <SidebarMenuButton
                                    key={subItem.url}
                                    asChild
                                    isActive={isItemActive(subItem.url)}
                                    size="sm"
                                    className="w-full justify-start"
                                    tooltip={subItem.title}
                                    onClick={() => setOpenMobile(false)}
                                  >
                                    <Link
                                      href={subItem.url}
                                      className="h-full w-full flex items-center "
                                    >
                                      <span className="sidebar-collapsed:hidden text-sm">
                                        {subItem.title}
                                      </span>
                                    </Link>
                                  </SidebarMenuButton>
                                ))}
                              </div>
                            )}
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            })}
        </ScrollArea>
        {/* Common navigation for all roles */}
        <Separator className="" />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonNav
                .filter((item) => hasAccess(item.roles))
                .map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton
                        asChild
                        isActive={isItemActive(item.url)}
                        className="w-full justify-start"
                        tooltip={item.title}
                        onClick={() => setOpenMobile(false)}
                      >
                        <Link
                          href={item.url}
                          className="h-full w-full flex items-center "
                        >
                          {Icon && <Icon size={18} />}
                          <span className="sidebar-collapsed:hidden">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t shrink-0">
        <DashboardNavUser user={user!} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
