// components/dashboard/events/CalendarView.tsx
"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useEvents from "@/hooks/useEvents";
import { IEvent } from "@/interfaces/event.interface";
import { cn } from "@/lib/utils";
import { EVENT_STATUS_META, EventStatus } from "@/utils/event-colors";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { EventLegend } from "./EventLegend";
import { EventSheet } from "./EventSheet";

type ViewMode = "month";

function getEventStatus(event: IEvent): EventStatus {
  const now = new Date();
  const start = new Date(event.startDate);

  if (start < now) return "past";
  if (!event.isPublished) return "draft";
  return "upcoming";
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const router = useRouter();

  // Calculate date range based on view mode
  const { startDate, endDate } = useMemo(() => {
    if (viewMode === "month") {
      return {
        startDate: startOfMonth(currentDate),
        endDate: endOfMonth(currentDate),
      };
    } else {
      return {
        startDate: startOfWeek(currentDate, { weekStartsOn: 0 }),
        endDate: endOfWeek(currentDate, { weekStartsOn: 0 }),
      };
    }
  }, [currentDate, viewMode]);

  // Fetch events for the current view
  const { events, isPending, isError } = useEvents({
    page: 1,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    limit: 100,
  });

  // Get days for month view
  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }
    return [];
  }, [currentDate, viewMode]);

  // Group events by day for month view
  const eventsByDay = useMemo(() => {
    const map = new Map<string, IEvent[]>();

    events?.forEach((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);

      // For multi-day events, add to each day in the range
      const days = differenceInDays(eventEnd, eventStart) + 1;
      for (let i = 0; i < days; i++) {
        const currentDay = addDays(eventStart, i);
        const dateKey = format(currentDay, "yyyy-MM-dd");

        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)?.push(event);
      }
    });

    return map;
  }, [events]);

  const handlePrevious = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: IEvent) => {
    setSelectedEvent(event);
    setSheetOpen(true);
  };

  const getViewTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    } else {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, "MMMM d")} - ${format(end, "d, yyyy")}`;
      } else {
        return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
      }
    }
  };

  // Generate time slots from 12 AM to 11 PM
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = setHours(setMinutes(new Date(), 0), i);
    return format(hour, "h a");
  });

  if (isError) {
    return (
      <EmptyState
        icon={CalendarIcon}
        title="Error Loading Events"
        description="There was an error loading the calendar. Please try again."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle and Controls */}
      <Card className="py-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="my-2">
                <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
              </div>

              <EventLegend />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleToday} size="sm">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Month View */}

      <Card className="overflow-hidden py-0">
        <CardContent className="p-0">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-center text-sm font-semibold text-muted-foreground border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayEvents = eventsByDay.get(dateKey) || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={index}
                  className={`
                      min-h-[120px] p-2 border-r border-b last:border-r-0
                      ${!isCurrentMonth ? "bg-muted/30 dark:bg-muted/10" : "bg-background"}
                      ${isToday ? "ring-2 ring-primary/60 bg-primary/5 dark:bg-primary/10" : ""}
                    `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`
                          text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full
                          ${isToday ? "bg-primary text-primary-foreground" : ""}
                          ${!isCurrentMonth ? "text-muted-foreground" : ""}
                        `}
                    >
                      {format(day, "d")}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {isPending ? (
                      <div className="space-y-1">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ) : (
                      dayEvents
                        .slice(0, 3)
                        .map((event) => (
                          <EventCard
                            key={event._id}
                            event={event}
                            onClick={() => handleEventClick(event)}
                          />
                        ))
                    )}
                    {dayEvents.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs h-auto py-1 px-2"
                      >
                        +{dayEvents.length - 3} more
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <EventSheet
        event={selectedEvent}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}

// Helper function to parse event time
function parseEventTime(time: string): number {
  if (!time) return 12;
  const match = time.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
  if (match) {
    let hour = parseInt(match[1]);
    const minute = match[2] ? parseInt(match[2]) : 0;
    const meridian = match[3]?.toUpperCase();

    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;

    // Round to nearest hour for display
    return minute >= 30 ? hour + 1 : hour;
  }
  return 12;
}

// Month view event card component
function EventCard({ event, onClick }: { event: IEvent; onClick: () => void }) {
  const status = getEventStatus(event);
  const meta = EVENT_STATUS_META[status];

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-2 rounded-lg border transition-all duration-200",
        "hover:shadow-sm hover:scale-[1.02]",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        meta.className,
      )}
    >
      {/* Title */}
      <p className="text-xs font-semibold truncate leading-tight">
        {event.title}
      </p>

      {/* Meta */}
      <div className="flex items-center justify-between mt-1 gap-2">
        <div className="flex items-center gap-1 text-[10px] opacity-80">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(event.startDate), "h:mm a")}</span>
        </div>

        {event.requiresRegistration && <Users className="h-3 w-3 opacity-70" />}
      </div>

      {/* Badges */}
      <div className="flex gap-1 mt-1 flex-wrap">
        {event.isMultiDay && (
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
            Multi-day
          </Badge>
        )}
        {!event.isPublished && (
          <Badge
            variant="outline"
            className="text-[9px] px-1.5 py-0 border-yellow-500/40 text-yellow-600 dark:text-yellow-400"
          >
            Draft
          </Badge>
        )}
      </div>
    </button>
  );
}

// Week view event card component with spanning support
function WeekEventCard({
  event,
  onClick,
  isSpanning = false,
  spanDays = 1,
}: {
  event: IEvent;
  onClick: () => void;
  isSpanning?: boolean;
  spanDays?: number;
}) {
  const status = getEventStatus(event);
  const meta = EVENT_STATUS_META[status];

  const roundedClass = isSpanning
    ? "rounded-l-md rounded-r-none"
    : "rounded-md";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-full text-left p-2 text-xs transition-all duration-200 border",
        "hover:shadow-md hover:scale-[1.01]",
        "focus:outline-none focus:ring-2 focus:ring-primary/40",
        meta.className,
        roundedClass,
      )}
    >
      {/* Title */}
      <p className="font-semibold truncate leading-tight">{event.title}</p>

      {/* Time */}
      <p className="text-[10px] opacity-80 mt-0.5">
        {format(new Date(event.startDate), "h:mm a")}
      </p>

      {/* Extra */}
      <div className="flex items-center gap-1 mt-1">
        {event.requiresRegistration && <Users className="h-3 w-3 opacity-80" />}

        {event.isMultiDay && (
          <Badge
            variant="secondary"
            className="text-[9px] px-1 py-0 bg-white/20 text-white"
          >
            {spanDays}d
          </Badge>
        )}
      </div>
    </button>
  );
}
