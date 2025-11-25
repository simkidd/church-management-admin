"use client";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { IEvent } from "@/interfaces/event.interface";
import { ApiResponse } from "@/interfaces/response.interface";
import { eventsApi } from "@/lib/api/event.api";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { EventForm } from "./EventForm";
import { Skeleton } from "@/components/ui/skeleton";

const EventEditComp = ({ eventId }: { eventId: string }) => {
  const router = useRouter();

  const { data, isPending, error } = useQuery<ApiResponse<IEvent>>({
    queryKey: ["event", eventId],
    queryFn: () => eventsApi.getEventById(eventId),
    enabled: !!eventId,
  });

  const event = data?.data;

  if (isPending) {
    return <EventEditSkeleton />;
  }

  if (error || !data?.data) {
    return (
      <EmptyState
        icon={Calendar}
        title="Sermon Not Found"
        description="Failed to load event. Please try again."
        action={<Button onClick={() => router.back()}>Go Back</Button>}
      />
    );
  }

  return <EventForm event={event} isEdit={true} />;
};

export default EventEditComp;

function EventEditSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Skeleton */}
          <div className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Image Upload Skeleton */}
          <div className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Registration Settings Skeleton */}
          <div className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>

          {/* Publication Settings Skeleton */}
          <div className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>

          {/* Event Summary Skeleton */}
          <div className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
