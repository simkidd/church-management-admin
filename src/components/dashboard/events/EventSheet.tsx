"use client";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { IEvent } from "@/interfaces/event.interface";
import { format } from "date-fns";
import { Calendar, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsApi } from "@/lib/api/event.api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface Props {
  event: IEvent | null;
  open: boolean;
  onClose: () => void;
}

export function EventSheet({ event, open, onClose }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: (data) => {
      toast.success("Success", {
        description: data.message || "Event removed successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      queryClient.invalidateQueries({ queryKey: ["infinite-events"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyHighlights"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to create event",
      });
    },
  });

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;

    deleteMutation.mutate(pendingDeleteId, {
      onSuccess: () => {
        setConfirmOpen(false);
        setPendingDeleteId(null);
        onClose();
      },
    });
  };

  if (!event) return null;

  const durationDays = Math.ceil(
    (new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold">
              {event?.title}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 px-4">
            {/* Date */}
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />

              <div>
                <p className="font-medium">
                  {format(new Date(event.startDate), "EEE, MMM d yyyy")} —{" "}
                  {format(new Date(event.endDate), "EEE, MMM d yyyy")}
                </p>

                <p className="text-muted-foreground">
                  {format(new Date(event.startDate), "h:mm a")} →{" "}
                  {format(new Date(event.endDate), "h:mm a")}
                </p>

                {event.isMultiDay && (
                  <p className="text-xs text-blue-500 mt-1">
                    {durationDays} day event
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {event?.location && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <p>{event?.location}</p>
              </div>
            )}

            {/* Registration */}
            <div className="flex items-start gap-3 text-sm">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <p>
                {event?.requiresRegistration
                  ? `Registered: ${event?.registeredUsers?.length || 0}${
                      event?.maxAttendees ? ` / ${event?.maxAttendees}` : ""
                    }`
                  : "Open Event"}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event?.description}
              </p>
            </div>
          </div>

          <SheetFooter>
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button
                onClick={() =>
                  router.push(`/dashboard/events/${event?._id}/edit`)
                }
              >
                Edit Event
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleDeleteClick(event._id)}
                disabled={deleteMutation.isPending}
              >
                Delete Event
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The event will be permanently
              removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
