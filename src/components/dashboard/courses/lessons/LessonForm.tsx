// components/lesson-form.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Loader2,
  Video,
  FileText,
  Headphones,
  Upload,
  X,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { lessonApi } from "@/lib/api/lesson.api";
import { ILesson } from "@/interfaces/lesson.interface";
import { Accept, useDropzone } from "react-dropzone";
import { RichTextEditor } from "@/components/common/RichTextEditor";

const lessonFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["video", "article", "audio"]),
  content: z.object({
    videoUrl: z.string().optional(),
    audioUrl: z.string().optional(),
    textContent: z.string().optional(),
  }),
  isPreview: z.boolean(),
  isPublished: z.boolean(),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonFormProps {
  moduleId: string;
  courseId: string;
  initialValues?: Partial<ILesson>;
  children?: React.ReactNode;
  isEdit?: boolean;
}

const getFormDefaultValues = (
  initialValues?: Partial<ILesson>,
): LessonFormData => ({
  title: initialValues?.title || "",
  description: initialValues?.description || "",
  type: initialValues?.type || "video",
  content: {
    videoUrl: initialValues?.content?.videoUrl || "",
    audioUrl: initialValues?.content?.audioUrl || "",
    textContent: initialValues?.content?.textContent || "",
  },
  isPreview: initialValues?.isPreview || false,
  isPublished: initialValues?.isPublished || false,
});

export const LessonForm: React.FC<LessonFormProps> = ({
  moduleId,
  courseId,
  initialValues,
  children,
  isEdit = false,
}) => {
  const [open, setOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: getFormDefaultValues(initialValues),
  });

  const lessonType = form.watch("type");

  const previewUrl = useMemo(() => {
    if (!mediaFile) return null;
    return URL.createObjectURL(mediaFile);
  }, [mediaFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;

    form.reset(getFormDefaultValues(isEdit ? initialValues : undefined));
    setMediaFile(null);
  }, [open, isEdit, initialValues, form]);

  useEffect(() => {
    setMediaFile(null);

    if (lessonType === "article") {
      form.setValue("content.videoUrl", "");
      form.setValue("content.audioUrl", "");
      return;
    }

    if (lessonType === "video") {
      form.setValue("content.audioUrl", "");
      return;
    }

    if (lessonType === "audio") {
      form.setValue("content.videoUrl", "");
    }
  }, [lessonType, form]);

  const dropzoneAccept: Accept =
    lessonType === "audio"
      ? {
          "audio/mpeg": [".mp3"],
          "audio/wav": [".wav"],
          "audio/x-wav": [".wav"],
          "audio/mp4": [".m4a"],
          "audio/aac": [".aac"],
          "audio/ogg": [".ogg"],
          "audio/webm": [".webm"],
        }
      : {
          "video/mp4": [".mp4"],
          "video/quicktime": [".mov"],
          "video/webm": [".webm"],
          "video/x-msvideo": [".avi"],
          "video/x-matroska": [".mkv"],
        };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: dropzoneAccept,
    multiple: false,
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles[0]) {
        setMediaFile(acceptedFiles[0]);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return lessonApi.create(moduleId, data);
    },
    onSuccess: () => {
      toast.success("Lesson created successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to create lesson", {
        description: error.response?.data?.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return lessonApi.update(initialValues?._id as string, data);
    },
    onSuccess: () => {
      toast.success("Lesson updated successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update lesson", {
        description: error.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: LessonFormData) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("type", values.type);
    formData.append("content", JSON.stringify(values.content));
    formData.append("isPreview", String(values.isPreview));
    formData.append("isPublished", String(values.isPublished));

    if (mediaFile) {
      formData.append("media", mediaFile);
    }

    if (
      isEdit &&
      !mediaFile &&
      initialValues?.type !== "article" &&
      initialValues?.type !== values.type
    ) {
      formData.append("removeMedia", "true");
    }

    if (isEdit && initialValues?._id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    form.reset();
    setMediaFile(null);
    setOpen(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const existingVideoUrl = initialValues?.content?.videoUrl;
  const existingAudioUrl = initialValues?.content?.audioUrl;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lesson" : "Add New Lesson"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the lesson content and settings."
              : "Create a new lesson for this module."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="mt-4 gap-4">
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Lesson Title *</FieldLabel>
                  <Input
                    {...field}
                    placeholder="e.g., Introduction to Components"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Brief description of this lesson..."
                    disabled={isLoading}
                    rows={2}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Lesson Type */}
            <Controller
              name="type"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Lesson Type</FieldLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "video", icon: Video, label: "Video" },
                      {
                        value: "article",
                        icon: FileText,
                        label: "Article",
                      },
                      { value: "audio", icon: Headphones, label: "Audio" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => field.onChange(type.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          field.value === type.value
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:border-muted-foreground/25"
                        }`}
                      >
                        <type.icon
                          className={`h-6 w-6 ${
                            field.value === type.value
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            />

            {/* Content based on type */}
            {lessonType === "video" && (
              <Field>
                <FieldLabel>Video Content</FieldLabel>

                {previewUrl && mediaFile ? (
                  <div className="relative aspect-video rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                    <video
                      src={previewUrl}
                      className="w-full h-full rounded-lg"
                      controls
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setMediaFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : existingVideoUrl ? (
                  <div className="relative aspect-video rounded-lg border bg-muted overflow-hidden">
                    <video
                      src={existingVideoUrl}
                      className="w-full h-full rounded-lg"
                      controls
                    />
                    <div
                      {...getRootProps()}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      <p className="text-white font-medium">
                        Click to replace video
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Drop video here..."
                        : "Drag & drop video or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP4, MOV, AVI, MKV, WebM up to 500MB
                    </p>
                  </div>
                )}
              </Field>
            )}

            {lessonType === "article" && (
              <Controller
                name="content.textContent"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Article Content</FieldLabel>
                    <RichTextEditor
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Write your article content here..."
                      disabled={isLoading}
                      minHeight="300px"
                      maxHeight="500px"
                      className="w-full"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            {lessonType === "audio" && (
              <Field>
                <FieldLabel>Audio Content</FieldLabel>

                {previewUrl && mediaFile ? (
                  <div className="relative rounded-lg border bg-muted p-4">
                    <audio src={previewUrl} className="w-full" controls />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setMediaFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : existingAudioUrl ? (
                  <div className="relative rounded-lg border bg-muted p-4">
                    <audio src={existingAudioUrl} className="w-full" controls />
                    <div
                      {...getRootProps()}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
                    >
                      <input {...getInputProps()} />
                      <p className="text-white font-medium">
                        Click to replace audio
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Headphones className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Drop audio here..."
                        : "Upload audio file"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      MP3, WAV, M4A, AAC, OGG, WebM up to 500MB
                    </p>
                  </div>
                )}
              </Field>
            )}

            {/* Published */}
            <Controller
              name="isPublished"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <Checkbox
                    id="isPublished"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                  <div>
                    <label
                      htmlFor="isPublished"
                      className="font-medium cursor-pointer"
                    >
                      Published
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Make this lesson visible to students
                    </p>
                  </div>
                </div>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin " />
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Save Changes" : "Create Lesson"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonForm;
