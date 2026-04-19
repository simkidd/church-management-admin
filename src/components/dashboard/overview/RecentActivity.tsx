import { IDashboardActivity } from "@/interfaces/dashboard.interface";
import { format } from "date-fns";

export function RecentActivity({ data }: { data: IDashboardActivity[] }) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No recent activity</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="text-sm">
          <p>
            <span className="font-medium">{item.user}</span> enrolled in{" "}
            <span className="font-medium">{item.course}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(item.date), "MMM d, yyyy")}
          </p>
        </div>
      ))}
    </div>
  );
}
