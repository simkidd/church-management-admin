"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "./RoleBadge";
import { Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";
import { getUserInitials, getUserRole } from "@/utils/helpers/user";

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  // Mock user data - in real app, fetch by userId
  const user = {
    id: userId,
    firstName: "John",
    lastName: "Doe",
    email: "john@church.org",
    phone: "+1 (555) 123-4567",
    status: "active" as const,
    isVerified: true,
    gender: "male" as const,
    address: "123 Church Street",
    city: "New York",
    state: "NY",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-06-15T08:00:00Z",
    updatedAt: "2023-06-15T08:00:00Z",
    isAdmin: false,
    isSuperAdmin: false,
    isInstructor: false,
    isPastor: true,
    avatar: {
      url: "",
      publicId: "",
    },
  };

  const userRole = getUserRole(user);
  const userInitials = getUserInitials(user);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar?.url} />
                <AvatarFallback className="text-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <RoleBadge role={userRole} />
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {user.address}, {user.city}, {user.state}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="md:col-span-2">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">
                      First Name
                    </label>
                    <p>{user.firstName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Last Name
                    </label>
                    <p>{user.lastName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Gender
                    </label>
                    <p className="capitalize">{user.gender}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Status
                    </label>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Primary Role
                    </label>
                    <p>{userRole}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Member Since
                    </label>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Last Login
                    </label>
                    <p>{new Date(user.lastLogin).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">
                      Email Verified
                    </label>
                    <Badge variant={user.isVerified ? "default" : "secondary"}>
                      {user.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Super Admin</span>
                    <Badge variant={user.isSuperAdmin ? "default" : "outline"}>
                      {user.isSuperAdmin ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Admin Access</span>
                    <Badge variant={user.isAdmin ? "default" : "outline"}>
                      {user.isAdmin ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Instructor</span>
                    <Badge variant={user.isInstructor ? "default" : "outline"}>
                      {user.isInstructor ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Pastor</span>
                    <Badge variant={user.isPastor ? "default" : "outline"}>
                      {user.isPastor ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
