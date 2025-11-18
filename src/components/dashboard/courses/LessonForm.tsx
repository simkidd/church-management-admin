"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ILesson } from "@/interfaces/course.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  FileIcon,
  FileText,
  Loader2,
  UploadIcon,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Form validation schema
const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  content: z
    .string()
    .min(1, "Content is required")
    .max(2000, "Content is too long"),
  duration: z.string().min(1, "Duration is required"),
  order: z.string().min(1, "Order is required"),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface LessonFormProps {
  courseId: string;
  lessonId?: string;
  existingLessons: Array<{ order: number }>;
  isEdit?: boolean;
  initialData?: ILesson;
}

export const VIDEO_CONFIG = {
  accept: {
    "video/mp4": [".mp4"],
    "video/quicktime": [".mov"],
    "video/x-msvideo": [".avi"],
    "video/x-matroska": [".mkv"],
    "video/webm": [".webm"],
  },
  maxSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: "MP4, MOV, AVI, MKV, WebM",
};

export const LessonForm = ({
  courseId,
  existingLessons,
  lessonId,
  initialData,
  isEdit = false,
}: LessonFormProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(
    isEdit && initialData?.video?.url ? initialData.video.url : null
  );

  // Calculate next available order
  const nextOrder =
    existingLessons.length > 0
      ? Math.max(...existingLessons.map((lesson) => lesson.order)) + 1
      : 1;

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      duration: initialData?.duration?.toString() || "",
      order: initialData?.order?.toString() || nextOrder.toString(),
    },
  });

  const addLessonMutation = useMutation({
    mutationFn: (data: {
      formData: FormData;
      onProgress?: (progress: number) => void;
    }) => {
      return courseApi.addLesson(courseId, data.formData, data.onProgress);
    },
    onSuccess: () => {
      toast.success("Lesson added successfully");

      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      router.push(`/dashboard/courses/${courseId}?tab=lessons`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to add lesson";
      toast.error("Error", {
        description: errorMessage,
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: (data: {
      formData: FormData;
      onProgress?: (progress: number) => void;
    }) => {
      if (!lessonId) throw new Error("Lesson ID is required for update");
      return courseApi.updateLesson(
        courseId,
        lessonId,
        data.formData,
        data.onProgress
      );
    },
    onSuccess: () => {
      toast.success("Lesson updated successfully");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["lesson", courseId, lessonId],
      });
      router.push(`/dashboard/courses/${courseId}?tab=lessons`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || "Failed to update lesson";
      toast.error("Error", {
        description: errorMessage,
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const onSubmit = async (values: LessonFormValues) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("duration", values.duration);
    formData.append("order", values.order);

    if (videoFile) {
      formData.append("video", videoFile);
    }

    // For updates, you might want to handle video removal
    if (isEdit && !videoFile && !existingVideoUrl) {
      formData.append("removeVideo", "true");
    }

    // Debug: Log all FormData entries
    // console.log("FormData entries:");
    // for (const [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }

    if (isEdit) {
      await updateLessonMutation.mutateAsync({
        formData,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });
    } else {
      await addLessonMutation.mutateAsync({
        formData,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      accept: VIDEO_CONFIG.accept,
      maxFiles: 1,
      maxSize: VIDEO_CONFIG.maxSize,
      onDrop: (acceptedFiles, rejectedFiles) => {
        if (acceptedFiles.length > 0) {
          const file = acceptedFiles[0];
          setVideoFile(file);
          setExistingVideoUrl(null);
        }

        if (rejectedFiles.length > 0) {
          const errorCode = rejectedFiles[0].errors[0]?.code;
          const message =
            errorCode === "file-too-large"
              ? `File size must be less than ${formatFileSize(
                  VIDEO_CONFIG.maxSize
                )}`
              : `Invalid file type. Only ${VIDEO_CONFIG.supportedFormats} allowed`;

          toast.error(message);
        }
      },
      disabled: isUploading,
    });

  const removeFile = () => {
    setVideoFile(null);
    setExistingVideoUrl(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isSubmitting = isEdit
    ? updateLessonMutation.isPending
    : addLessonMutation.isPending;

  const dropzoneClassName = cn(
    "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
    isDragActive && "border-primary bg-primary/5",
    isDragReject && "border-destructive bg-destructive/5",
    isUploading && "opacity-50 cursor-not-allowed",
    !isUploading &&
      !isDragActive &&
      !isDragReject &&
      "hover:border-primary/50 hover:bg-muted/50"
  );

  const hasVideo = videoFile || existingVideoUrl;

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/courses/${courseId}?tab=lessons`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Lesson" : "Add New Lesson"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Update your lesson details"
              : "Create a new lesson for your course"}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
            <CardDescription>
              Fill in the details for your new lesson. You can add a video later
              if needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Lesson Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter lesson title"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          A clear and descriptive title for the lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Lesson Content *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what students will learn in this lesson..."
                            className="min-h-[120px]"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a detailed description of the lesson content
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g., 30"
                            min="1"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          Estimated time to complete this lesson
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Order */}
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lesson Order *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 50 }, (_, i) => i + 1).map(
                              (order) => (
                                <SelectItem
                                  key={order}
                                  value={order.toString()}
                                >
                                  {order}
                                  {existingLessons.some(
                                    (lesson) => lesson.order === order
                                  ) && " (occupied)"}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Position of this lesson in the course sequence
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Video Upload */}
                  <div className="md:col-span-2 space-y-4">
                    <FormLabel>Lesson Video (Optional)</FormLabel>

                    {/* Dropzone Area */}
                    <div {...getRootProps({ className: dropzoneClassName })}>
                      <input {...getInputProps()} />

                      {hasVideo ? (
                        <div className="space-y-3">
                          {/* Preview */}
                          <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                            <Video className="h-12 w-12 text-blue-500" />
                            {!isUploading && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFile();
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground text-center">
                            {videoFile ? videoFile.name : "Existing video"}
                            {existingVideoUrl && (
                              <div className="text-xs text-green-600 mt-1">
                                ✓ Current video
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            disabled={isUploading}
                          >
                            Change File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <UploadIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              {isDragActive
                                ? "Drop the video here"
                                : "Upload Video"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {isDragReject
                                ? "File type not supported"
                                : "Drag video here or click to browse"}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            disabled={isUploading}
                          >
                            Browse Files
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    {hasVideo && (
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {videoFile ? videoFile.name : "Existing video"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {videoFile
                                ? formatFileSize(videoFile.size)
                                : "Uploaded video"}
                            </p>
                          </div>
                        </div>
                        {!isUploading && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={removeFile}
                            className="h-6 w-6 shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Supported formats: {VIDEO_CONFIG.supportedFormats}</p>
                      <p>
                        Maximum file size:{" "}
                        {formatFileSize(VIDEO_CONFIG.maxSize)}
                      </p>
                      {isEdit && existingVideoUrl && (
                        <p className="text-green-600">
                          ✓ A video is currently uploaded for this lesson
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading video...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {uploadProgress > 0
                          ? "Uploading..."
                          : isEdit
                          ? "Updating Lesson..."
                          : "Adding Lesson..."}
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        {isEdit ? "Update Lesson" : "Add Lesson"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/courses/${courseId}?tab=lessons`)
                    }
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
