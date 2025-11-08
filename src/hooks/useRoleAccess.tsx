"use client";

import { useAuthStore } from "@/stores/auth.store";
import {
  getUserRole,
  hasRoleAccess,
  hasDashboardAccess,
} from "@/utils/helpers/user";

export function useRoleAccess() {
  const { user } = useAuthStore();

  const userRole = getUserRole(user);

  const hasAccess = (requiredRoles: string[]): boolean => {
    return hasRoleAccess(user, requiredRoles);
  };

  const hasAnyAccess = (requiredRoles: string[]): boolean => {
    return hasAccess(requiredRoles);
  };

  return {
    userRole,
    hasAccess,
    hasAnyAccess,
    isSuperAdmin: user?.isSuperAdmin || false,
    isAdmin: user?.isAdmin || false,
    isPastor: user?.isPastor || false,
    isInstructor: user?.isInstructor || false,
    canAccessDashboard: hasDashboardAccess(user),
  };
}
