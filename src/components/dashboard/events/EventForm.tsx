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
import { Progress } from "@/components/ui/progress";
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
import {
  ArrowLeft,
  CalendarIcon,
  ImageIcon,
  Loader2,
  MapPin,
  Upload,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const eventSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000),
    startDate: z.date({
      error: "Start date is required",
    }),
    endDate: z.date({
      error: "End date is required",
    }),
    time: z.string().min(1, "Time is required"),
    location: z.string().min(1, "Location is required"),
    requiresRegistration: z.boolean(),
    maxAttendees: z.number().min(1).optional().nullable(),
    isPublished: z.boolean(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date cannot be before start date",
    path: ["endDate"],
  });

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: IEvent;
  isEdit?: boolean;
}

interface UploadProgress {
  image: number;
  total: number;
}

export function EventForm({ event, isEdit = false }: EventFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [openStartDate, setOpenStartDate] = useState(false);
  const [openEndDate, setOpenEndDate] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    image: 0,
    total: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      setIsUploading(true);
      setUploadProgress({ image: 0, total: 0 });

      return eventsApi.createEvent(data, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({
            ...prev,
            total: progress,
          }));
        }
      });
    },
    onSuccess: (data) => {
      toast.success("Success", {
        description: data.message || "Event created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/dashboard/events");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to create event",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress({ image: 0, total: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => {
      setIsUploading(true);
      setUploadProgress({ image: 0, total: 0 });

      return eventsApi.updateEvent(id, data, (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress((prev) => ({
            ...prev,
            total: progress,
          }));
        }
      });
    },
    onSuccess: (data) => {
      toast.success("Success", {
        description: data.message || "Event updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", event?._id] });
      router.push(`/dashboard/events/${event?._id}`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to update event",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress({ image: 0, total: 0 });
    },
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      time: "",
      location: "",
      requiresRegistration: false,
      maxAttendees: null,
      isPublished: true,
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
        time: event.time,
        location: event.location,
        requiresRegistration: event.requiresRegistration,
        maxAttendees: event.maxAttendees || null,
        isPublished: event.isPublished,
      });
    }
  }, [event, isEdit, form]);

  useEffect(() => {
    if (event && isEdit && event.image?.url) {
      setImagePreview(event.image.url);
    }
  }, [event, isEdit]);

  // Image dropzone configuration
  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate image file
      if (!file.type.startsWith("image/")) {
        toast.error("Error", {
          description: "Please select a valid image file",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("Error", {
          description: "Image file must be less than 10MB",
        });
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }, []);

  const imageDropzone = useDropzone({
    onDrop: onImageDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleCancel = () => {
    // Show confirmation if there's any data entered
    const hasData =
      form.getValues().title ||
      form.getValues().description ||
      imageFile ||
      form.getValues().location;

    if (hasData) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmCancel) return;
    }

    router.push("/dashboard/events");
  };

  const onSubmit = async (values: EventFormValues) => {
    const formData = new FormData();

    // Append form values
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (
          (key === "startDate" || key === "endDate") &&
          value instanceof Date
        ) {
          // Format date to ISO string for backend
          formData.append(key, value.toISOString());
        } else if (key === "maxAttendees" && !values.requiresRegistration) {
          // Don't append maxAttendees if registration is not required
          return;
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append image file
    if (imageFile) {
      formData.append("image", imageFile);
    }

    if (isEdit && event) {
      await updateMutation.mutateAsync({ id: event._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
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
            <Card className="lg:col-span-2 h-fit">
              <CardContent className="space-y-6">
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
                            <FormLabel>Start Date *</FormLabel>
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
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setOpenStartDate(false);
                                  }}
                                  disabled={(date) =>
                                    date < new Date("1900-01-01")
                                  }
                                  autoFocus
                                />
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
                            <FormLabel>End Date *</FormLabel>
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
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    field.onChange(date);
                                    setOpenEndDate(false);
                                  }}
                                  disabled={(date) =>
                                    date < new Date("1900-01-01")
                                  }
                                  autoFocus
                                />
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
                        <span>This is a multi-day event</span>
                      </div>
                    )}

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                isMultiDay
                                  ? "e.g., Daily from 9:00 AM to 5:00 PM"
                                  : "e.g., 2:00 PM - 4:00 PM"
                              }
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            {isMultiDay
                              ? "Specify daily schedule or event duration"
                              : "Specify event time or duration"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                {/* Image Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Event Image</h3>
                  <div className="space-y-2">
                    <FormLabel>
                      Event Image
                      {isEdit && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Optional - leave empty to keep current)
                        </span>
                      )}
                    </FormLabel>
                    <div
                      {...imageDropzone.getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors aspect-video",
                        imageDropzone.isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25",
                        (imagePreview || imageFile) && "border-primary"
                      )}
                    >
                      <input {...imageDropzone.getInputProps()} />
                      {imagePreview ? (
                        <div className="space-y-2 aspect-video">
                          <div className="relative w-full h-full">
                            <Image
                              src={imagePreview}
                              alt="Event preview"
                              className="object-contain rounded"
                              fill
                            />
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview("");
                              }}
                            >
                              Change Image
                            </Button>
                            <div className="text-xs text-muted-foreground text-left">
                              <p>{imageFile?.name}</p>
                              <p>
                                {imageFile?.size &&
                                  (imageFile?.size / (1024 * 1024)).toFixed(
                                    2
                                  )}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video">
                          {imageDropzone.isDragActive ? (
                            <Upload className="h-8 w-8 mx-auto text-primary" />
                          ) : (
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {imageDropzone.isDragActive
                              ? "Drop the image here"
                              : "Drag & drop an image file here"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG, WebP up to 10MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              imageDropzone.open();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isEdit ? "Change Image" : "Select Image"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {imageDropzone.fileRejections.length > 0 && (
                      <div className="text-sm text-destructive">
                        {imageDropzone.fileRejections[0].errors[0].message}
                      </div>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                      <h4 className="font-medium text-sm">Upload Progress</h4>
                      <Progress value={uploadProgress.total} />
                      <div className="text-xs text-muted-foreground text-center">
                        {uploadProgress.total < 100
                          ? "Uploading files, please wait..."
                          : "Processing files..."}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="h-fit">
              <CardContent className="space-y-6">
                {/* Registration Settings */}
                <div className="space-y-4">
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
                              placeholder="50"
                              {...field}
                              onChange={(e) =>
                                field.onChange(e.target.valueAsNumber)
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
                </div>

                {/* Publication Settings */}
                <div className="space-y-4">
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
                </div>

                {/* Event Summary */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <h3 className="text-lg font-medium">Event Summary</h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        <span>Date{isMultiDay ? "s" : ""}</span>
                      </div>
                      <p className="font-medium text-sm">
                        {startDate && endDate ? (
                          isMultiDay ? (
                            <>
                              {format(startDate, "MMM d")} -{" "}
                              {format(endDate, "MMM d, yyyy")}
                            </>
                          ) : (
                            format(startDate, "PPP")
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
                        variant={requiresRegistration ? "default" : "secondary"}
                      >
                        {requiresRegistration
                          ? "Registration Required"
                          : "Open Event"}
                      </Badge>
                      {isMultiDay && <Badge variant="default">Multi-Day</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <div className="flex gap-3 justify-end">
              {/* Cancel Button */}
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>

              {/* Submit Button */}
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
          </div>
        </form>
      </Form>
    </div>
  );
}
