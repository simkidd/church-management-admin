"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, Phone } from "lucide-react";

interface Appointment {
  id: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  pastor: string;
  date: string;
  time: string;
  duration: string;
  type: "counseling" | "prayer" | "guidance" | "other";
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes?: string;
  location: string;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    memberName: "Sarah Johnson",
    memberEmail: "sarah@email.com",
    memberPhone: "+1 (555) 123-4567",
    pastor: "Pastor John",
    date: "2024-01-18",
    time: "2:00 PM",
    duration: "45 minutes",
    type: "counseling",
    status: "scheduled",
    notes: "Marriage counseling session",
    location: "Pastor's Office",
  },
  {
    id: "2",
    memberName: "Mike Chen",
    memberEmail: "mike@email.com",
    memberPhone: "+1 (555) 987-6543",
    pastor: "Pastor Sarah",
    date: "2024-01-17",
    time: "10:30 AM",
    duration: "30 minutes",
    type: "prayer",
    status: "confirmed",
    location: "Prayer Room",
  },
  {
    id: "3",
    memberName: "Emily Davis",
    memberEmail: "emily@email.com",
    memberPhone: "+1 (555) 456-7890",
    pastor: "Pastor John",
    date: "2024-01-16",
    time: "4:00 PM",
    duration: "1 hour",
    type: "guidance",
    status: "completed",
    location: "Main Office",
  },
];

export function AppointmentCalendar() {
  const [view, setView] = useState<"list" | "calendar">("list");

  const getTypeColor = (type: string) => {
    switch (type) {
      case "counseling": return "bg-blue-100 text-blue-800";
      case "prayer": return "bg-purple-100 text-purple-800";
      case "guidance": return "bg-green-100 text-green-800";
      case "other": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-yellow-100 text-yellow-800";
      case "confirmed": return "bg-green-100 text-green-800";
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
        
        <Button>
          Set Availability
        </Button>
      </div>

      {view === "list" ? (
        <div className="space-y-4">
          {mockAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.memberName}</h3>
                        <p className="text-muted-foreground mt-1">
                          with {appointment.pastor} • {appointment.type}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                        <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time} ({appointment.duration})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{appointment.memberPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button size="sm">
                      Confirm
                    </Button>
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
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Appointment Calendar</h3>
              <p className="text-muted-foreground mb-4">
                Interactive calendar view coming soon
              </p>
              <Button onClick={() => setView("list")}>
                Switch to List View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {mockAppointments.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
          <p className="text-muted-foreground mb-4">
            Members can book appointments once you set your availability
          </p>
          <Button>
            Set Availability
          </Button>
        </div>
      )}
    </div>
  );
}