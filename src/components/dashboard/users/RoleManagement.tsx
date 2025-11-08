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
import { IUser } from "@/interfaces/user.interface";
import { getUserInitials, getUserRoles } from "@/utils/helpers/user";
import {
  Edit,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import EditRolesForm from "./EditRolesForm";
import RolesStats from "./RolesStats";

// Mock data - replace with actual API calls
const mockUsers: IUser[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john@church.org",
    phone: "+1 (555) 123-4567",
    gender: "male",
    avatar: {
      url: "",
      publicId: "",
    },
    address: "123 Main St",
    city: "New York",
    state: "NY",
    isVerified: true,
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    isAdmin: true,
    isSuperAdmin: false,
    isInstructor: false,
    isPastor: true,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah@church.org",
    phone: "+1 (555) 123-4567",
    gender: "female",
    avatar: {
      url: "",
      publicId: "",
    },
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    isVerified: true,
    status: "active",
    lastLogin: "2024-01-14T08:15:00Z",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-14T08:15:00Z",
    isAdmin: false,
    isSuperAdmin: false,
    isInstructor: true,
    isPastor: false,
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Chen",
    email: "mike@church.org",
    phone: "+1 (555) 123-4567",
    gender: "male",
    avatar: {
      url: "",
      publicId: "",
    },
    address: "789 Pine Rd",
    city: "Chicago",
    state: "IL",
    isVerified: true,
    status: "active",
    lastLogin: "2024-01-15T14:20:00Z",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-15T14:20:00Z",
    isAdmin: false,
    isSuperAdmin: false,
    isInstructor: false,
    isPastor: false,
  },
  {
    id: "4",
    firstName: "Pastor",
    lastName: "David",
    email: "david@church.org",
    phone: "+1 (555) 123-4567",
    gender: "male",
    avatar: {
      url: "",
      publicId: "",
    },
    address: "321 Church St",
    city: "Houston",
    state: "TX",
    isVerified: true,
    status: "active",
    lastLogin: "2024-01-13T09:45:00Z",
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-13T09:45:00Z",
    isAdmin: false,
    isSuperAdmin: false,
    isInstructor: false,
    isPastor: true,
  },
  {
    id: "5",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily@church.org",
    phone: "+1 (555) 123-4567",
    gender: "female",
    avatar: {
      url: "",
      publicId: "",
    },
    address: "654 Elm St",
    city: "Phoenix",
    state: "AZ",
    isVerified: true,
    status: "inactive",
    lastLogin: "2024-01-10T11:20:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-10T11:20:00Z",
    isAdmin: false,
    isSuperAdmin: false,
    isInstructor: true,
    isPastor: false,
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter users based on search and role
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" ||
      (selectedRole === "super-admin" && user.isSuperAdmin) ||
      (selectedRole === "admin" && user.isAdmin) ||
      (selectedRole === "pastor" && user.isPastor) ||
      (selectedRole === "instructor" && user.isInstructor) ||
      (selectedRole === "member" &&
        !user.isAdmin &&
        !user.isSuperAdmin &&
        !user.isPastor &&
        !user.isInstructor);

    return matchesSearch && matchesRole;
  });

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

  console.log("mock users", mockUsers);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <RolesStats users={mockUsers} />

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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="flex h-10 w-full sm:w-40 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    {Object.entries(rolePermissions).map(([key, role]) => (
                      <option key={key} value={key}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Button>Export Report</Button>
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
                  {filteredUsers.map((user) => (
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
                          {getUserRoles(user).map((role) => getRoleBadge(role))}
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
                        {new Date(user.lastLogin).toLocaleDateString()}
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

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedRole !== "all"
                      ? "Try adjusting your search terms or filters"
                      : "No users available in the system"}
                  </p>
                </div>
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
