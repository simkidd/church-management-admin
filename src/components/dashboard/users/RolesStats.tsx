"use client";
import React from "react";
import { rolePermissions } from "./RoleManagement";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, RefreshCw, AlertCircle, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import usersApi from "@/lib/api/user.api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const RolesStats = () => {
  const {
    data: roleStats,
    isLoading: isLoadingStats,
    isError: isStatsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["role-stats"],
    queryFn: () => usersApi.getRolesStats(),
  });

  if (isStatsError) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-semibold">Failed to load statistics</p>
                <p className="text-sm text-muted-foreground">
                  Unable to fetch role statistics
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStats()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingStats) {
    return (
      <div className="space-y-4">
        {/* Total Users Skeleton */}
        <Card className="bg-muted/50">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          </CardContent>
        </Card>

        {/* Role Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Object.entries(rolePermissions).map(([key]) => (
            <Card key={key}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
                <Skeleton className="h-1 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsData = roleStats?.data;
  const totalUsers = statsData?.total || 0;

  return (
    <div className="space-y-4">
      {/* Total Users Card */}
      <Card className="bg-muted/50">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <div>
                <p className="text-lg font-semibold">
                  {totalUsers} Total Users
                </p>
                <p className="text-sm text-muted-foreground">
                  Across all roles and permissions
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStats()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Role Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Object.entries(rolePermissions).map(([key, role]) => {
          // Map role keys from the API response
          let count = 0;
          let percentage = "0";

          switch (key) {
            case "super-admin":
              count = statsData?.roles.superAdmin || 0;
              percentage = statsData?.percentages.superAdmin || "0";
              break;
            case "admin":
              count = statsData?.roles.admin || 0;
              percentage = statsData?.percentages.admin || "0";
              break;
            case "instructor":
              count = statsData?.roles.instructor || 0;
              percentage = statsData?.percentages.instructor || "0";
              break;
            case "pastor":
              count = statsData?.roles.pastor || 0;
              percentage = statsData?.percentages.pastor || "0";
              break;
            case "member":
              count = statsData?.roles.member || 0;
              percentage = statsData?.percentages.member || "0";
              break;
            default:
              count = 0;
              percentage = "0";
          }

          return (
            <Card key={key} className="relative overflow-hidden">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {percentage}%
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${role.color.split(" ")[0]}`}>
                    <Shield className="h-4 w-4" />
                  </div>
                </div>

                {/* Progress bar */}
                {totalUsers > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-border">
                    <div
                      className={`h-full ${
                        role.color.split(" ")[0]
                      } transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RolesStats;
