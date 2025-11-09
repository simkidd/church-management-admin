"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useUsers from "@/hooks/useUsers";
import { ListUsersParams } from "@/interfaces/user.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserRoles } from "@/utils/helpers/user";
import { rolePermissions } from "./RoleManagement";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { getPaginationRange } from "@/components/shared/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { debounce } from "@/utils/helpers/debounce";

export function UserManagement() {
  const [filters, setFilters] = useState<ListUsersParams>({
    page: 1,
    limit: 10,
  });
  const { users, isPending, totalUsers, totalPages } = useUsers(filters);
  const [searchInput, setSearchInput] = useState("");

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

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setFilters({ page: 1, limit: 10 });
    debouncedSearch.cancel();
  };

  const onPaginationChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = rolePermissions[role as keyof typeof rolePermissions];
    if (!roleConfig) return null; // fallback if role not found
    return (
      <Badge key={role} variant="secondary" className={roleConfig.color}>
        {roleConfig.name}
      </Badge>
    );
  };

  const hasActiveFilters = filters.search || filters.role || filters.status;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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

              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({totalUsers})</CardTitle>
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
                  <Button variant="outline" onClick={handleResetFilters}>
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
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar?.url} />
                            <AvatarFallback>
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "N/A"}</TableCell>
                      <TableCell>
                        {getUserRoles(user).map((role) => getRoleBadge(role))}
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
                          ? new Date(user.lastLogin).toLocaleDateString()
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
                            <Link href={`/dashboard/users/${user.id}`}>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {users && users.length > 0 && (
          <CardFooter className="flex justify-between">
            {/* Pagination controls */}
            {users.length > 0 && totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPaginationChange(filters.page - 1)}
                      aria-disabled={filters.page === 1}
                      className={cn(
                        "cursor-pointer",
                        filters.page === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {getPaginationRange(filters.page, totalPages).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === filters.page}
                        onClick={() => onPaginationChange(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => onPaginationChange(filters.page + 1)}
                      aria-disabled={filters.page >= totalPages}
                      className={cn(
                        "cursor-pointer",
                        filters.page >= totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
