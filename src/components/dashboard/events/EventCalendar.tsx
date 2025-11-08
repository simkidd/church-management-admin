"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Users, Clock } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  type: "service" | "meeting" | "special" | "class";
  attendees: number;
  maxAttendees?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

const mockEvents: Event[] = [
  {
    id: "1",
    title: "Sunday Morning Service",
    description: "Weekly worship service with communion",
    date: "2024-01-21",
    time: "10:00 AM",
    duration: "2 hours",
    location: "Main Sanctuary",
    type: "service",
    attendees: 156,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Bible Study Group",
    description: "Weekly bible study and discussion",
    date: "2024-01-17",
    time: "7:00 PM",
    duration: "1.5 hours",
    location: "Room 201",
    type: "class",
    attendees: 23,
    maxAttendees: 30,
    status: "upcoming",
  },
  {
    id: "3",
    title: "Leadership Meeting",
    description: "Monthly church leadership planning session",
    date: "2024-01-15",
    time: "6:30 PM",
    duration: "2 hours",
    location: "Conference Room",
    type: "meeting",
    attendees: 12,
    status: "completed",
  },
];

export function EventCalendar() {
  const [view, setView] = useState<"list" | "calendar">("list");

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "service": return "bg-blue-100 text-blue-800";
      case "meeting": return "bg-purple-100 text-purple-800";
      case "special": return "bg-orange-100 text-orange-800";
      case "class": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-green-100 text-green-800";
      case "ongoing": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={view === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("list")}
          >
            List View
          </Button>
          <Button
            variant={view === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("calendar")}
          >
            Calendar View
          </Button>
        </div>
      </div>

      {view === "list" ? (
        <div className="space-y-4">
          {mockEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{event.title}</h3>
                        <p className="text-muted-foreground mt-1">{event.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.attendees}
                          {event.maxAttendees && ` / ${event.maxAttendees}`} attendees
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Link href={`/dashboard/events/${event.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/events/${event.id}/attendees`}>
                      <Button size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-muted-foreground mb-4">
                Full calendar view coming soon
              </p>
              <Button onClick={() => setView("list")}>
                Switch to List View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mockEvents.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
          <p className="text-muted-foreground mb-4">
            Start by creating your first event
          </p>
          <Link href="/dashboard/events/create">
            <Button>
              Create Event
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}