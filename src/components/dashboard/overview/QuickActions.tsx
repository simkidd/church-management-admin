import { Button } from "@/components/ui/button";
import { Plus, Users, BookOpen, Calendar, Mic } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    title: "Add User",
    description: "Create new user account",
    icon: Users,
    href: "/dashboard/users/create",
    color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  },
  {
    title: "Create Course",
    description: "Set up new learning course",
    icon: BookOpen,
    href: "/dashboard/courses/create",
    color: "bg-green-50 text-green-700 hover:bg-green-100",
  },
  {
    title: "Schedule Event",
    description: "Plan church event",
    icon: Calendar,
    href: "/dashboard/events/create",
    color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
  },
  {
    title: "Add Sermon",
    description: "Upload new sermon",
    icon: Mic,
    href: "/dashboard/sermons/create",
    color: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  },
];

export function QuickActions() {
  return (
    <div className="grid gap-3">
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Button
            variant="outline"
            className={`w-full justify-start h-auto p-3 ${action.color} border-0`}
          >
            <action.icon className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">{action.title}</div>
              <div className="text-xs opacity-70">{action.description}</div>
            </div>
          </Button>
        </Link>
      ))}
    </div>
  );
}