"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IUser, ListUsersParams } from "@/interfaces/user.interface";
import { getUserInitials, getUserRoles } from "@/utils/helpers/user";
import {
  Edit,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import EditRolesForm from "./EditRolesForm";
import RolesStats from "./RolesStats";
import useUsers from "@/hooks/useUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { debounce } from "@/utils/helpers/debounce";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export const rolePermissions = {
  "super-admin": {
    name: "Super Admin",
    description: "Full system access including user management",
    permissions: [
      "Manage all users",
      "Create/delete users",
      "Assign user role",
      "System configuration",
      "Access all modules",
      "Database management",
    ],
    color: "bg-red-100 text-red-800",
  },
  admin: {
    name: "Admin",
    description: "Full system access except user management",
    permissions: [
      "Manage courses and content",
      "Manage events and sermons",
      "View analytics",
      "Manage appointments",
      "Content moderation",
      "System monitoring",
    ],
    color: "bg-blue-100 text-blue-800",
  },
  pastor: {
    name: "Pastor",
    description: "Can manage sermons and appointments",
    permissions: [
      "Create and manage sermons",
      "Manage appointments",
      "View member profiles",
      "Event management",
      "Pastoral care tracking",
      "Sermon analytics",
    ],
    color: "bg-purple-100 text-purple-800",
  },
  instructor: {
    name: "Instructor",
    description: "Can create and manage courses",
    permissions: [
      "Create and manage courses",
      "Upload lesson content",
      "Create exams and quizzes",
      "Grade student work",
      "Track student progress",
      "Course analytics",
    ],
    color: "bg-green-100 text-green-800",
  },
  member: {
    name: "Member",
    description: "Regular church member access",
    permissions: [
      "View personal profile",
      "Enroll in courses",
      "Register for events",
      "Book appointments",
      "Access sermons",
      "View personal progress",
    ],
    color: "bg-gray-100 text-gray-800",
  },
};

export function RoleManagement() {
  const [filters, setFilters] = useState<ListUsersParams>({
    page: 1,
    limit: 10,
  });
  const { users, isPending, totalUsers, totalPages } = useUsers(filters);
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilters((prev) => ({
          ...prev,
          search: searchValue.trim() || undefined,
          page: 1,
        }));
      }, 500), // 500ms delay
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleRoleChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      role: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({ page: 1, limit: 10 });
    debouncedSearch.cancel();
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const roleConfig = rolePermissions[role as keyof typeof rolePermissions];
    if (!roleConfig) return null; // fallback if role not found
    return (
      <Badge key={role} variant="secondary" className={roleConfig.color}>
        {roleConfig.name}
      </Badge>
    );
  };

  // Handle edit user roles
  const handleEditRoles = (user: IUser) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  // Handle save roles
  const handleSaveRoles = (updatedRoles: string[]) => {
    // In real app, this would call an API to update user roles
    console.log("Updating roles for user:", selectedUser?.id, updatedRoles);
    setIsEditDialogOpen(false);
    setSelectedUser(null);
  };

  const hasActiveFilters = filters.search || filters.role;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <RolesStats />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Roles</TabsTrigger>
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchInput}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>

                  <Select
                    value={filters.role || "all"}
                    onValueChange={handleRoleChange}
                  >
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super-admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="pastor">Pastor</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={handleResetFilters}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignment</CardTitle>
              <CardDescription>
                Manage roles and permissions for system users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPending ? (
                <Table>
                  <TableBody>
                    {[...Array(5)].map((_, rowIndex) => (
                      <TableRow key={`skeleton-${rowIndex}`}>
                        {[...Array(7)].map((_, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : !users || users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  description="Try adjusting your filters or search terms."
                  action={
                    hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={handleResetFilters}
                        className="mt-4"
                      >
                        Reset Filters
                      </Button>
                    )
                  }
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar?.url} />
                              <AvatarFallback>
                                {getUserInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getUserRoles(user).map((role) =>
                              getRoleBadge(role)
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active" ? "default" : "secondary"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.lastLogin
                            ? format(new Date(user.lastLogin), "MMM dd, yyyy")
                            : "Never"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditRoles(user)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Roles
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Access
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {/* Role Permissions Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(rolePermissions).map(([key, role]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${role.color.split(" ")[0]}`}
                    >
                      <Shield className="h-4 w-4" />
                    </div>
                    {role.name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {role.permissions.map((permission, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {permission}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Roles Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              Update roles for {selectedUser?.firstName}{" "}
              {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>

          <EditRolesForm
            user={selectedUser!}
            onSave={handleSaveRoles}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
