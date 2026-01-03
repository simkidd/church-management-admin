"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { lessonApi } from "@/lib/api/lesson.api";
import { ILesson } from "@/interfaces/lesson.interface";

const lessonFormSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  content: z.string().min(1, "Lesson content is required"),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonFormProps {
  moduleId: string;
  lastOrder?: number;
  lessonId?: string; // optional, for editing
  initialValues?: ILesson;
  children: React.ReactNode;
  courseId: string;
}

export default function LessonForm({
  moduleId,
  lastOrder = 0,
  lessonId,
  initialValues,
  children,
  courseId,
}: LessonFormProps) {
  const [open, setOpen] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(
    initialValues?.video?.url || null
  );
  const [removeVideo, setRemoveVideo] = useState(false);

  const queryClient = useQueryClient();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      content: initialValues?.content || "",
    },
  });

  // Dropzone for video upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "video/*": [".mp4", ".mov", ".webm"] },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024, // 500MB
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        toast.error("Invalid video file or too large (max 500MB)");
        return;
      }
      const file = acceptedFiles[0];
      setVideoFile(file);
      setPreviewVideo(URL.createObjectURL(file));
      setRemoveVideo(false);
    },
  });

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setPreviewVideo(null);
    if (initialValues?.video?.url) setRemoveVideo(true);
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => lessonApi.create(formData),
    onSuccess: (data) => {
      toast.success(data.message || "Lesson created successfully");
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: () => toast.error("Failed to create lesson"),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      lessonApi.update(lessonId as string, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Lesson updated successfully");
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: () => toast.error("Failed to update lesson"),
  });

  const onSubmit = (values: LessonFormData) => {
    const formData = new FormData();
    formData.append("module", moduleId);
    formData.append("title", values.title);
    formData.append("content", values.content);
    formData.append("order", String(lastOrder + 1));
    formData.append("removeVideo", removeVideo ? "true" : "false");

    if (videoFile) formData.append("video", videoFile);

    if (lessonId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setOpen(false);
    form.reset();
    setVideoFile(null);
    setPreviewVideo(initialValues?.video?.url || null);
    setRemoveVideo(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lessonId ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="space-y-4">
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Lesson Title</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Introduction to Faith"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="content"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Content</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Lesson notes or summary"
                    rows={4}
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel>Video (optional)</FieldLabel>
              {previewVideo ? (
                <div className="relative aspect-video rounded-lg border-2 border-dashed">
                  <video
                    src={previewVideo}
                    controls
                    className="w-full h-full object-contain"
                    controlsList="nodownload"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={handleRemoveVideo}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center justify-center gap-2 aspect-video">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Drop the video here..."
                        : "Drag & drop a video, or click to select"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, WEBM up to 500MB
                    </p>
                  </div>
                </div>
              )}
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {lessonId ? "Updating..." : "Creating..."}
                </>
              ) : lessonId ? (
                "Update Lesson"
              ) : (
                "Create Lesson"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
