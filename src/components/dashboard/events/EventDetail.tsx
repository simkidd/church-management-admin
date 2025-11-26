// components/dashboard/events/EventDetail.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IEvent } from "@/interfaces/event.interface";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { eventsApi } from "@/lib/api/event.api";
import { ApiResponse } from "@/interfaces/response.interface";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/EmptyState";

interface EventDetailProps {
  id: string;
}

export function EventDetail({ id }: EventDetailProps) {
  const router = useRouter();

  const { data, isPending, error } = useQuery<ApiResponse<IEvent>>({
    queryKey: ["event", id],
    queryFn: () => eventsApi.getEventById(id),
  });

  const event = data?.data;

  // Handle loading state
  if (isPending) {
    return <EventDetailSkeleton />;
  }

  // Handle error state
  if (error || !event) {
    return (
      <EmptyState
        icon={Calendar}
        title="Event Not Found"
        description="Failed to load event. Please try again."
        action={
          <Button onClick={() => router.push("/dashboard/events")}>
            Back to Events
          </Button>
        }
      />
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const isPast = endDate < new Date();
  const isRegistrationFull =
    event.requiresRegistration &&
    event.maxAttendees &&
    event.registeredUsers?.length >= event.maxAttendees;

  const formatDateDisplay = () => {
    if (event.isMultiDay) {
      return `${format(startDate, "EEEE, MMMM dd")} - ${format(
        endDate,
        "EEEE, MMMM dd, yyyy"
      )}`;
    } else {
      return format(startDate, "EEEE, MMMM dd, yyyy");
    }
  };

  const handleBack = () => {
    router.push("/dashboard/events");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">
              Event details and information
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/dashboard/events/${event._id}/edit`}>
            <Edit className="h-4 w-4" />
            Edit Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.image?.url && (
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video relative">
                  <Image
                    src={event.image.url}
                    alt={event.title}
                    fill
                    className="object-cover rounded-lg"
                    priority
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {event.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Registered Users */}
          {event.requiresRegistration &&
            event.registeredUsers &&
            event.registeredUsers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Registered Attendees ({event.registeredUsers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {event.registeredUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-2 rounded-lg border"
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {user.firstName?.[0]}
                          {user.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Information */}
          <Card>
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Date{event.isMultiDay ? "s" : ""}</span>
                </div>
                <p className="font-medium">{formatDateDisplay()}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time</span>
                </div>
                <p className="font-medium">{event.time}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="font-medium">{event.location}</p>
              </div>

              {event.requiresRegistration && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Registration</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {event.registeredUsers?.length || 0}
                      {event.maxAttendees && ` / ${event.maxAttendees}`}{" "}
                      registered
                    </p>
                    {isRegistrationFull && (
                      <Badge variant="destructive">Event Full</Badge>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Created By</span>
                </div>
                <p className="font-medium">
                  {event.createdBy.firstName} {event.createdBy.lastName}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant={isPast ? "secondary" : "default"}>
                  {isPast ? "Past Event" : "Upcoming"}
                </Badge>
                <Badge variant={event.isPublished ? "default" : "secondary"}>
                  {event.isPublished ? "Published" : "Draft"}
                </Badge>
                <Badge
                  variant={event.requiresRegistration ? "default" : "secondary"}
                >
                  {event.requiresRegistration
                    ? "Registration Required"
                    : "Open Event"}
                </Badge>
                {event.isMultiDay && <Badge variant="default">Multi-Day</Badge>}
              </div>

              {!isPast && event.requiresRegistration && !isRegistrationFull && (
                <Button className="w-full" asChild>
                  <Link href={`/events/${event._id}`} target="_blank">
                    View Public Page
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-md" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Skeleton */}
          <Skeleton className="aspect-video rounded-lg" />

          {/* Description Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
