"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import useEvents from "@/hooks/useEvents";
import { format } from "date-fns";

export function MonthCalendarPopover({
  children,
}: {
  children: React.ReactNode;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { events } = useEvents({ page: 1, limit: 100 });

  const monthEvents = events?.filter((event) => {
    if (!date) return false;

    const eventDate = new Date(event.startDate);

    return (
      eventDate.getMonth() === date.getMonth() &&
      eventDate.getFullYear() === date.getFullYear()
    );
  });

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>

      <PopoverContent className="w-[350px] space-y-4">
        <Calendar mode="single" selected={date} onSelect={setDate} />

        <div className="max-h-[200px] overflow-y-auto">
          <p className="text-sm font-medium mb-2">Events this month</p>

          {monthEvents?.length ? (
            <div className="space-y-2">
              {monthEvents.map((event) => (
                <div key={event._id} className="text-sm border rounded-md p-2">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {format(new Date(event.startDate), "PPP")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No events this month
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
