"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoleBadge } from "./RoleBadge";
import { Mail, Phone, MapPin, Calendar, Edit, User2 } from "lucide-react";
import { getUserInitials, getUserRole } from "@/utils/helpers/user";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import usersApi from "@/lib/api/user.api";
import { ApiResponse } from "@/interfaces/response.interface";
import { IUser } from "@/interfaces/user.interface";
import { EmptyState } from "@/components/shared/EmptyState";
import { UserProfileSkeleton } from "./UserProfileSkeleton";
import { format } from "date-fns";

interface UserProfileProps {
  userId: string;
}

export function UserProfile({ userId }: UserProfileProps) {
  const { data, isPending, error } = useQuery<ApiResponse<IUser>>({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getUserById(userId),
    enabled: !!userId,
  });

  const user = data?.data as IUser;

  if (isPending) {
    return <UserProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <div className="">
        <EmptyState
          icon={User2}
          title="User Not Found"
          description="The user you're looking for doesn't exist or you
                  don't have permission to view."
          action={
            <Button asChild>
              <Link href={"/dashboard/users"}>Back to Users</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const userRole = getUserRole(user);
  const userInitials = getUserInitials(user);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
          <p className="text-muted-foreground">
            View and manage user information
          </p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={user?.avatar?.url}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
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
                  {user.address
                    ? `${user.address}, ${user.city}, ${user.state}`
                    : "N/A"}
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
              {/* <TabsTrigger value="activity">Activity</TabsTrigger> */}
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
                      <p>{user.firstName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Last Name
                      </label>
                      <p>{user.lastName || "N/A"}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Gender
                      </label>
                      <p className="capitalize">{user.gender || "N/A"}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-muted-foreground">
                        Status
                      </label>
                      <Badge
                        variant={
                          user.status === "active" ? "default" : "secondary"
                        }
                      >
                        {user.status || "N/A"}
                      </Badge>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Primary Role
                      </label>
                      <p>{userRole || "N/A"}</p>
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
                      <p>{format(new Date(user.createdAt), "MMM dd, yyyy")}</p>
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground">
                        Last Login
                      </label>
                      <p>{format(new Date(user.lastLogin), "MMM dd, yyyy")}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-medium text-muted-foreground">
                        Email Verified
                      </label>
                      <Badge
                        variant={user.isVerified ? "default" : "secondary"}
                      >
                        {user.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={Calendar}
                    title="No activity yet"
                    description="This user hasn't performed any actions that are tracked in the system."
                  />
                </CardContent>
              </Card>
            </TabsContent> */}

            <TabsContent value="permissions">
              <Card>
                <CardHeader>
                  <CardTitle>Role Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Super Admin</span>
                      <Badge
                        variant={user.isSuperAdmin ? "default" : "outline"}
                      >
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
                      <Badge
                        variant={user.isInstructor ? "default" : "outline"}
                      >
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
    </div>
  );
}
