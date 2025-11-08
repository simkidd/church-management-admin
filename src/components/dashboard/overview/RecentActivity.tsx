import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      initials: "SJ",
    },
    action: "enrolled in",
    target: "Bible Study 101",
    time: "2 hours ago",
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      initials: "MC",
    },
    action: "completed",
    target: "New Members Course",
    time: "4 hours ago",
  },
  {
    id: "3",
    user: {
      name: "Pastor John",
      initials: "PJ",
    },
    action: "published new sermon",
    target: "The Power of Faith",
    time: "1 day ago",
  },
  {
    id: "4",
    user: {
      name: "Emily Davis",
      initials: "ED",
    },
    action: "registered for",
    target: "Sunday Service",
    time: "2 days ago",
  },
];

export function RecentActivity() {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.user.avatar} />
            <AvatarFallback className="text-xs">
              {activity.user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {activity.action} <span className="font-medium">{activity.target}</span>
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  );
}