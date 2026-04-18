// components/dashboard/events/EventForm.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { IEvent } from "@/interfaces/event.interface";
import { eventsApi } from "@/lib/api/event.api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format, isSameDay } from "date-fns";
import { ArrowLeft, CalendarIcon, Loader2, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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

const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must be less than 5000 characters"),
    startDate: z.date({
      error: "Start date is required",
    }),
    endDate: z.date({
      error: "End date is required",
    }),
    location: z.string().min(1, "Location is required"),
    requiresRegistration: z.boolean(),
    maxAttendees: z.number().min(1).optional().nullable(),
    isPublished: z.boolean(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after or equal to start date",
    path: ["endDate"],
  });

export type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: IEvent;
  isEdit?: boolean;
}

export function EventForm({ event, isEdit = false }: EventFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: EventFormValues) => eventsApi.createEvent(data),
    onSuccess: (data) => {
      toast.success("Success", {
        description: data.message || "Event created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      queryClient.invalidateQueries({ queryKey: ["infinite-events"] });
      queryClient.invalidateQueries({ queryKey: ["weeklyHighlights"] });
      router.push("/dashboard/events");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to create event",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EventFormValues }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: (data) => {
      toast.success("Success", {
        description: data.message || "Event updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["allEvents"] });
      queryClient.invalidateQueries({ queryKey: ["event", event?._id] });
      router.push(`/dashboard/events`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to update event",
      });
    },
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      location: "",
      requiresRegistration: false,
      isPublished: false,
    },
  });

  const requiresRegistration = form.watch("requiresRegistration");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const isMultiDay = startDate && endDate && !isSameDay(startDate, endDate);

  useEffect(() => {
    if (event && isEdit) {
      const startDate = event.startDate
        ? new Date(event.startDate)
        : new Date();
      const endDate = event.endDate ? new Date(event.endDate) : new Date();

      form.reset({
        title: event.title,
        description: event.description,
        startDate: startDate,
        endDate: endDate,
        location: event.location,
        requiresRegistration: event.requiresRegistration,
        maxAttendees: event.maxAttendees || null,
        isPublished: event.isPublished,
      });
    }
  }, [event, isEdit, form]);

  useEffect(() => {
    if (!requiresRegistration) {
      form.setValue("maxAttendees", null);
    }
  }, [requiresRegistration, form]);

  const handleCancel = () => {
    const hasData =
      form.getValues().title ||
      form.getValues().description ||
      form.getValues().location;

    if (hasData) {
      setShowCancelDialog(true);
      return;
    }

    router.push("/dashboard/events");
  };

  const onSubmit = async (values: EventFormValues) => {
    const payload = {
      ...values,
    };

    if (!values.requiresRegistration) {
      delete payload.maxAttendees;
    }

    if (values.requiresRegistration && !values.maxAttendees) {
      payload.maxAttendees = undefined;
    }

    if (isEdit && event) {
      await updateMutation.mutateAsync({ id: event._id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Update event details and information"
                : "Add a new event to your calendar"}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <Card className="lg:col-span-2 py-0">
                <CardContent className="space-y-6 pt-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>

                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your event..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date & Time */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date & Time *</FormLabel>
                              <Popover
                                open={openStartDate}
                                onOpenChange={setOpenStartDate}
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date and time</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDate = new Date(date);
                                        // Preserve the time from the current value
                                        if (field.value) {
                                          newDate.setHours(
                                            field.value.getHours(),
                                          );
                                          newDate.setMinutes(
                                            field.value.getMinutes(),
                                          );
                                        }
                                        field.onChange(newDate);
                                      }
                                      setOpenStartDate(false);
                                    }}
                                    autoFocus
                                  />
                                  <div className="p-3 border-t">
                                    <Input
                                      type="time"
                                      value={
                                        field.value
                                          ? format(field.value, "HH:mm")
                                          : "12:00"
                                      }
                                      onChange={(e) => {
                                        const [hours, minutes] =
                                          e.target.value.split(":");
                                        const newDate = new Date(
                                          field.value || new Date(),
                                        );
                                        newDate.setHours(parseInt(hours));
                                        newDate.setMinutes(parseInt(minutes));
                                        field.onChange(newDate);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date & Time *</FormLabel>
                              <Popover
                                open={openEndDate}
                                onOpenChange={setOpenEndDate}
                              >
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP p")
                                      ) : (
                                        <span>Pick a date and time</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                      if (date) {
                                        const newDate = new Date(date);
                                        if (field.value) {
                                          newDate.setHours(
                                            field.value.getHours(),
                                          );
                                          newDate.setMinutes(
                                            field.value.getMinutes(),
                                          );
                                        }
                                        field.onChange(newDate);
                                      }
                                      setOpenEndDate(false);
                                    }}
                                    autoFocus
                                  />
                                  <div className="p-3 border-t">
                                    <Input
                                      type="time"
                                      value={
                                        field.value
                                          ? format(field.value, "HH:mm")
                                          : "13:00"
                                      }
                                      onChange={(e) => {
                                        const [hours, minutes] =
                                          e.target.value.split(":");
                                        const newDate = new Date(
                                          field.value || new Date(),
                                        );
                                        newDate.setHours(parseInt(hours));
                                        newDate.setMinutes(parseInt(minutes));
                                        field.onChange(newDate);
                                      }}
                                    />
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {isMultiDay && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                          <CalendarIcon className="h-4 w-4" />
                          <span>
                            This is a multi-day event spanning{" "}
                            {Math.ceil(
                              (endDate.getTime() - startDate.getTime()) /
                                (1000 * 60 * 60 * 24),
                            )}{" "}
                            days
                          </span>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter event location"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sidebar */}
              <div className="space-y-6 ">
                {/* Registration Settings */}
                <Card>
                  <CardContent className="space-y-4">
                    <h3 className="text-lg font-medium">Registration</h3>

                    <FormField
                      control={form.control}
                      name="requiresRegistration"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Require Registration</FormLabel>
                            <FormDescription>
                              Attendees must register to attend
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {requiresRegistration && (
                      <FormField
                        control={form.control}
                        name="maxAttendees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Attendees</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="Unlimited"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  )
                                }
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription>
                              Leave empty for unlimited attendees
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Publication Settings */}
                <Card>
                  <CardContent className="space-y-4">
                    <h3 className="text-lg font-medium">Settings</h3>

                    <FormField
                      control={form.control}
                      name="isPublished"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Published</FormLabel>
                            <FormDescription>
                              Make this event publicly visible
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Event Summary */}
                <Card>
                  <CardContent className="space-y-4">
                    <h3 className="text-lg font-medium">Event Summary</h3>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>Date & Time</span>
                        </div>
                        <p className="font-medium text-sm">
                          {startDate && endDate ? (
                            isMultiDay ? (
                              <>
                                {format(startDate, "MMM d, yyyy h:mm a")} -{" "}
                                {format(endDate, "MMM d, yyyy h:mm a")}
                              </>
                            ) : (
                              format(startDate, "PPP p")
                            )
                          ) : (
                            "Not set"
                          )}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>Location</span>
                        </div>
                        <p className="font-medium text-sm">
                          {form.watch("location") || "Not set"}
                        </p>
                      </div>

                      {requiresRegistration && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>Registration</span>
                          </div>
                          <p className="font-medium text-sm">
                            {form.watch("maxAttendees")
                              ? `Max ${form.watch("maxAttendees")} attendees`
                              : "Unlimited attendees"}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Badge
                          variant={
                            form.watch("isPublished") ? "default" : "secondary"
                          }
                        >
                          {form.watch("isPublished") ? "Published" : "Draft"}
                        </Badge>
                        <Badge
                          variant={
                            requiresRegistration ? "default" : "secondary"
                          }
                        >
                          {requiresRegistration
                            ? "Registration Required"
                            : "Open Event"}
                        </Badge>
                        {isMultiDay && (
                          <Badge variant="default">Multi-Day</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : isEdit ? (
                  "Update Event"
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. If you leave now, all changes will be
              lost.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Continue editing
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={() => router.push("/dashboard/events")}
              className="bg-red-600 hover:bg-red-700"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
