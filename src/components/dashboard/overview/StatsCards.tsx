import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
}

const StatsCard = ({ title, value, change, trend, icon: Icon }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {trend === "up" ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {change}
        </p>
      </CardContent>
    </Card>
  );
};

export function StatsCards() {
  const stats = [
    {
      title: "Total Members",
      value: "1,247",
      change: "+12 this month",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Active Courses",
      value: "24",
      change: "+3 new",
      trend: "up" as const,
      icon: BookOpen,
    },
    {
      title: "This Month's Sermons",
      value: "8",
      change: "+2 from last month",
      trend: "up" as const,
      icon: FileText,
    },
    {
      title: "Upcoming Events",
      value: "15",
      change: "+5 scheduled",
      trend: "up" as const,
      icon: Calendar,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
}