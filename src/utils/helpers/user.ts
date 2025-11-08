import { IUser } from "@/interfaces/user.interface";

/**
 * Determines the user's primary role based on boolean flags
 * Follows hierarchy: Super Admin > Admin > Pastor > Instructor > Member
 */
export function getUserRole(user: IUser | null): string {
  if (!user) return "Member";

  if (user.isSuperAdmin) return "Super Admin";
  if (user.isAdmin) return "Admin";
  if (user.isPastor) return "Pastor";
  if (user.isInstructor) return "Instructor";

  return "Member";
}

/**
 * Checks if user has dashboard access
 * Dashboard is only for Admin, Super Admin, Pastor, and Instructor roles
 */
export function hasDashboardAccess(user: IUser | null): boolean {
  if (!user) return false;

  return (
    user.isAdmin || user.isSuperAdmin || user.isPastor || user.isInstructor
  );
}

/**
 * Gets all roles that a user has (can have multiple roles)
 */
export function getUserRoles(user: IUser | null): string[] {
  if (!user) return ["Member"];

  const roles: string[] = [];

  if (user.isSuperAdmin) roles.push("Super Admin");
  if (user.isAdmin) roles.push("Admin");
  if (user.isPastor) roles.push("Pastor");
  if (user.isInstructor) roles.push("Instructor");

  // If no specific roles, they're a member
  if (roles.length === 0) roles.push("Member");

  return roles;
}

/**
 * Checks if user has specific role access
 */
export function hasRoleAccess(
  user: IUser | null,
  requiredRoles: string[]
): boolean {
  if (!user) return false;

  const userRoles = getUserRoles(user);
  return userRoles.some((role) => requiredRoles.includes(role));
}

/**
 * Gets user initials for avatar fallback
 */
export function getUserInitials(user: IUser | null): string {
  if (!user) return "U";

  return `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();
}

/**
 * Gets user's full name
 */
export function getFullName(user: IUser | null): string {
  if (!user) return "Unknown User";

  return `${user.firstName} ${user.lastName}`.trim();
}
