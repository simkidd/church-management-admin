"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { Award, BookOpen, Calendar, Eye, FileText, Users } from "lucide-react";

import { QuickActions } from "@/components/dashboard/overview/QuickActions";
import { RecentActivity } from "@/components/dashboard/overview/RecentActivity";
import { TopCourses } from "@/components/dashboard/overview/TopCourses";
import { SkeletonDashboard } from "@/components/dashboard/overview/SkeletonDashboard";

export default function DashboardPage() {
  const { data, isPending, error } = useDashboardOverview();

  if (isPending) {
    return <SkeletonDashboard />;
  }

  if (error || !data) {
    return <div className="p-6 text-red-500">Failed to load dashboard</div>;
  }

  const overview = data.data;

  const stats = [
    {
      title: "Members",
      value: overview.kpis.totalUsers,
      icon: Users,
    },
    {
      title: "Courses",
      value: overview.kpis.totalCourses,
      icon: BookOpen,
    },
    {
      title: "Enrollments",
      value: overview.kpis.activeEnrollments,
      icon: Calendar,
    },
    {
      title: "Sermons",
      value: overview.kpis.totalSermons,
      icon: FileText,
    },
    {
      title: "Total Views",
      value: overview.kpis.totalViews,
      icon: Eye,
    },
    {
      title: "Certificates",
      value: overview.kpis.totalCertificates,
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of church learning activity
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* TOP COURSES */}
        <Card>
          <CardHeader>
            <CardTitle>Top Courses</CardTitle>
          </CardHeader>

          <CardContent>
            <TopCourses data={overview.topCourses} />
          </CardContent>
        </Card>

        {/* RECENT ACTIVITY */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>

          <CardContent>
            <RecentActivity data={overview.recentActivities} />
          </CardContent>
        </Card>
      </div>

      {/* LOWER SECTION */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* QUICK ACTIONS */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>

          <CardContent>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
