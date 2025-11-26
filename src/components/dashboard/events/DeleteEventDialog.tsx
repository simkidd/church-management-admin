// components/dashboard/events/DeleteEventDialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { eventsApi } from "@/lib/api/event.api";
import { IEvent } from "@/interfaces/event.interface";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: IEvent | null;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  event,
}: DeleteEventDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      toast.success("Success", {
        description: "Event deleted successfully",
      });
      router.push("/dashboard/events");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to delete event",
      });
    },
  });

  const handleDelete = () => {
    if (event) {
      deleteMutation.mutate(event._id);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the event{" "}
            <strong>&quot;{event?.title}&quot;</strong> and remove all
            associated data.
            {event?.registeredUsers && event?.registeredUsers?.length > 0 && (
              <div className="mt-2 text-destructive">
                Warning: This event has {event?.registeredUsers.length}{" "}
                registered attendees. Deleting it will remove their
                registrations.
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Event"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
