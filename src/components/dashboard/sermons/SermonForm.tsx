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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import usePastors from "@/hooks/use-pastors";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { ISermon } from "@/interfaces/sermon.interface";
import { sermonsApi } from "@/lib/api/sermon.api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  File,
  FileIcon,
  ImageIcon,
  Loader2,
  Upload,
  VideoIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const sermonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  preacher: z.string().min(1, "Preacher is required"),
  datePreached: z.date({
    error: "Date preached is required",
  }),
  scripture: z.string().optional(),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});

type SermonFormValues = z.infer<typeof sermonSchema>;

interface SermonFormProps {
  sermon?: ISermon;
  isEdit?: boolean;
}

interface UploadProgress {
  video: number;
  thumbnail: number;
  total: number;
}

export function SermonForm({ sermon, isEdit = false }: SermonFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [openDate, setOpenDate] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    video: 0,
    thumbnail: 0,
    total: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

  const { pastors, isPending: isLoadingPastors } = usePastors();

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      setIsUploading(true);
      setUploadProgress({ video: 0, thumbnail: 0, total: 0 });

      return sermonsApi.createSermon(data, (progressEvent) => {
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
        description: data.message || "Sermon created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["allSermons"] });
      router.push("/dashboard/sermons");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to create sermon",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress({ video: 0, thumbnail: 0, total: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => {
      setIsUploading(true);
      setUploadProgress({ video: 0, thumbnail: 0, total: 0 });

      return sermonsApi.updateSermon(id, data, (progressEvent) => {
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
        description: data.message || "Sermon updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["allSermons"] });
      queryClient.invalidateQueries({ queryKey: ["sermon", sermon?._id] });

      router.push(`/dashboard/sermons/${sermon?._id}`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to update sermon",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress({ video: 0, thumbnail: 0, total: 0 });
    },
  });

  const form = useForm<SermonFormValues>({
    resolver: zodResolver(sermonSchema),
    defaultValues: {
      title: "",
      description: "",
      preacher: "",
      datePreached: new Date(),
      scripture: "",
      isPublished: true,
      tags: "",
    },
  });

  useEffect(() => {
    if (sermon && isEdit) {
      const datePreached = sermon.datePreached
        ? new Date(sermon.datePreached)
        : new Date();

      form.reset({
        title: sermon.title,
        description: sermon.description,
        preacher: sermon.preacher._id,
        datePreached: datePreached,
        scripture: sermon.scripture || "",
        isPublished: sermon.isPublished,
        tags: sermon.tags?.join(", ") || "",
      });
    }
  }, [sermon, isEdit, form]);

  useEffect(() => {
    if (sermon && isEdit) {
      const timer = setTimeout(() => {
        setTags(sermon.tags || []);

        if (sermon.video?.url) {
          setVideoPreview(sermon.video.url);
        }
        if (sermon.thumbnail?.url) {
          setThumbnailPreview(sermon.thumbnail.url);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, []);

  // Video dropzone configuration
  const onVideoDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate video file
      if (!file.type.startsWith("video/")) {
        toast.error("Error", {
          description: "Please select a valid video file",
        });
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        // 500MB limit
        toast.error("Error", {
          description: "Video file must be less than 500MB",
        });
        return;
      }

      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  }, []);

  const videoDropzone = useDropzone({
    onDrop: onVideoDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
  });

  // Thumbnail dropzone configuration
  const onThumbnailDrop = useCallback((acceptedFiles: File[]) => {
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

      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  }, []);

  const thumbnailDropzone = useDropzone({
    onDrop: onThumbnailDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleCancel = () => {
    // Show confirmation if there's any data entered
    const hasData =
      form.getValues().title ||
      form.getValues().description ||
      videoFile ||
      thumbnailFile ||
      tags.length > 0;

    if (hasData) {
      const confirmCancel = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmCancel) return;
    }

    router.push("/dashboard/sermons");
  };

  const onSubmit = async (values: SermonFormValues) => {
    if (!videoFile && !isEdit && !sermon?.video?.url) {
      toast.error("Error", {
        description: "Video file is required",
      });
      return;
    }

    const formData = new FormData();

    // Append form values
    Object.entries(values).forEach(([key, value]) => {
      if (key !== "tags" && value !== undefined) {
        if (key === "datePreached" && value instanceof Date) {
          // Format date to ISO string for backend
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append tags
    formData.append("tags", tags.join(","));

    // Append files
    formData.append("video", videoFile!);

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    if (isEdit && sermon) {
      await updateMutation.mutateAsync({ id: sermon._id, data: formData });
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
            {isEdit ? "Edit Sermon" : "Create New Sermon"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update sermon details and media"
              : "Add a new sermon to your library"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sermon title" {...field} />
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
                            placeholder="Enter sermon description"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="preacher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preacher *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select preacher" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingPastors ? (
                                <SelectItem value="loading" disabled>
                                  Loading preachers...
                                </SelectItem>
                              ) : pastors?.length === 0 ? (
                                <SelectItem value="none" disabled>
                                  No preachers found
                                </SelectItem>
                              ) : (
                                pastors?.map((preacher) => (
                                  <SelectItem
                                    key={preacher._id}
                                    value={preacher._id}
                                  >
                                    {preacher.firstName} {preacher.lastName}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="datePreached"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date Preached *</FormLabel>
                          <Popover open={openDate} onOpenChange={setOpenDate}>
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
                                  setOpenDate(false);
                                }}
                                disabled={(date) =>
                                  date > new Date() ||
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

                  <FormField
                    control={form.control}
                    name="scripture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scripture Reference</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John 3:16" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="gap-1 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        >
                          {tag}
                          <X className="h-3 w-3 " />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-6">
                {/* Media Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Media</h3>

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <FormLabel>
                      Video {!isEdit && "*"}
                      {isEdit && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Optional - leave empty to keep current)
                        </span>
                      )}
                    </FormLabel>
                    <div
                      {...videoDropzone.getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors aspect-video",
                        videoDropzone.isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25",
                        (videoPreview || videoFile) && "border-primary"
                      )}
                    >
                      <input {...videoDropzone.getInputProps()} />
                      {videoPreview ? (
                        <div className="space-y-2 aspect-video">
                          <video
                            src={videoPreview}
                            className="w-full h-32 object-cover rounded"
                            controlsList="nodownload"
                            controls
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setVideoFile(null);
                                setVideoPreview("");
                              }}
                            >
                              Change Video
                            </Button>
                            <div className="text-xs text-muted-foreground text-left">
                              <p>{videoFile?.name}</p>
                              <p>
                                {videoFile?.size &&
                                  (videoFile?.size / (1024 * 1024)).toFixed(
                                    2
                                  )}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video">
                          {videoDropzone.isDragActive ? (
                            <FileIcon className="h-8 w-8 mx-auto text-primary" />
                          ) : (
                            <VideoIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {videoDropzone.isDragActive
                              ? "Drop the video here"
                              : "Drag & drop a video file here"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            MP4, MOV, AVI up to 500MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              videoDropzone.open();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isEdit ? "Change Video" : "Select Video"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {videoDropzone.fileRejections.length > 0 && (
                      <div className="text-sm text-destructive">
                        {videoDropzone.fileRejections[0].errors[0].message}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Upload */}
                  <div className="space-y-2">
                    <FormLabel>
                      Thumbnail
                      {isEdit && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Optional - leave empty to keep current)
                        </span>
                      )}
                    </FormLabel>
                    <div
                      {...thumbnailDropzone.getRootProps()}
                      className={cn(
                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors aspect-video",
                        thumbnailDropzone.isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/25",
                        (thumbnailPreview || thumbnailFile) && "border-primary"
                      )}
                    >
                      <input {...thumbnailDropzone.getInputProps()} />
                      {thumbnailPreview ? (
                        <div className="space-y-2">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            className="w-full h-32 object-cover rounded"
                            width={300}
                            height={300}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setThumbnailFile(null);
                                setThumbnailPreview("");
                              }}
                            >
                              Change Thumbnail
                            </Button>
                            <div className="text-xs text-muted-foreground text-left">
                              <p>{thumbnailFile?.name}</p>
                              <p>
                                {thumbnailFile?.size &&
                                  (thumbnailFile?.size / (1024 * 1024)).toFixed(
                                    2
                                  )}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center aspect-video">
                          {thumbnailDropzone.isDragActive ? (
                            <File className="h-8 w-8 mx-auto text-primary" />
                          ) : (
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                          )}
                          <p className="text-sm text-muted-foreground mt-2">
                            {thumbnailDropzone.isDragActive
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
                              thumbnailDropzone.open();
                            }}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isEdit ? "Change Thumbnail" : "Select Thumbnail"}
                          </Button>
                        </div>
                      )}
                    </div>
                    {thumbnailDropzone.fileRejections.length > 0 && (
                      <div className="text-sm text-destructive">
                        {thumbnailDropzone.fileRejections[0].errors[0].message}
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

                {/* Settings */}
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
                            Make this sermon publicly visible
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
                  "Update Sermon"
                ) : (
                  "Create Sermon"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
