"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useInstructors from "@/hooks/use-instructors";
import { ICourse } from "@/interfaces/course.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  User,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Form validation schema
const courseFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
  instructor: z.string().min(1, "Instructor is required"),
  duration: z
    .string()
    .min(2, "Duration is required")
    .max(30, "Duration must be less than 30 characters"),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  progressionMode: z.enum(["free", "sequential"]),
  learningObjectives: z.array(z.string().min(1, "Objective cannot be empty")),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  initialValues?: Partial<ICourse>;
  children?: React.ReactNode;
  isEdit?: boolean;
}

const CourseForm = ({
  children,
  initialValues,
  isEdit = false,
}: CourseFormProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialValues?.thumbnail?.url || null,
  );
  const [introVideoPreview, setIntroVideoPreview] = useState<string | null>(
    initialValues?.introVideo?.url || null,
  );

  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [removeIntroVideo, setRemoveIntroVideo] = useState(false);

  const { instructors, isPending: isLoadingInstructors } = useInstructors();

  // Get the selected instructor name for display
  const getSelectedInstructorName = (instructorId: string) => {
    const instructor = instructors?.find((inst) => inst.id === instructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : "";
  };

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      instructor: initialValues?.instructor?._id || "",
      duration: initialValues?.duration || "",
      isPublished: initialValues?.isPublished || false,
      isFeatured: initialValues?.isFeatured || false,
      progressionMode: initialValues?.progressionMode || "sequential",
      learningObjectives: initialValues?.learningObjectives || [],
    },
  });

  const selectedInstructorId = useWatch({
    control: form.control,
    name: "instructor",
  });

  const learningObjectives = useWatch({
    control: form.control,
    name: "learningObjectives",
  });

  const addObjective = () => {
    const current = form.getValues("learningObjectives") || [];
    form.setValue("learningObjectives", [...current, ""]);
  };

  const removeObjective = (index: number) => {
    const current = form.getValues("learningObjectives") || [];
    form.setValue(
      "learningObjectives",
      current.filter((_, i) => i !== index),
    );
  };

  const updateObjective = (index: number, value: string) => {
    const current = form.getValues("learningObjectives") || [];
    current[index] = value;
    form.setValue("learningObjectives", [...current]);
  };

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
    isDragActive: isThumbnailDragActive,
  } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB limit
    onDrop: (acceptedFiles, fileRejections) => {
      // Handle file rejections (too large, wrong type, etc.)
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          toast.error("Thumbnail is too large. Maximum size is 5MB.");
        } else {
          toast.error("Invalid thumbnail type. Please use JPEG, PNG, or WEBP.");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setThumbnailFile(file);
        setRemoveThumbnail(false);
      }
    },
  });

  const {
    getRootProps: getIntroVideoRootProps,
    getInputProps: getIntroVideoInputProps,
    isDragActive: isIntroVideoDragActive,
  } = useDropzone({
    accept: {
      "video/mp4": [".mp4"],
      "video/quicktime": [".mov"],
      "video/webm": [".webm"],
      "video/x-msvideo": [".avi"],
      "video/x-matroska": [".mkv"],
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024,
    onDrop: (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          toast.error("Intro video is too large. Maximum size is 500MB.");
        } else {
          toast.error(
            "Invalid video type. Please use MP4, MOV, AVI, MKV, or WEBM.",
          );
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setIntroVideoFile(file);
        setRemoveIntroVideo(false);
      }
    },
  });

  const thumbnailObjectUrl = useMemo(() => {
    return thumbnailFile ? URL.createObjectURL(thumbnailFile) : null;
  }, [thumbnailFile]);

  const introVideoObjectUrl = useMemo(() => {
    return introVideoFile ? URL.createObjectURL(introVideoFile) : null;
  }, [introVideoFile]);

  useEffect(() => {
    if (thumbnailObjectUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThumbnailPreview(thumbnailObjectUrl);
    } else if (!removeThumbnail) {
      setThumbnailPreview(initialValues?.thumbnail?.url || null);
    } else {
      setThumbnailPreview(null);
    }

    return () => {
      if (thumbnailObjectUrl) URL.revokeObjectURL(thumbnailObjectUrl);
    };
  }, [thumbnailObjectUrl, removeThumbnail, initialValues?.thumbnail?.url]);

  useEffect(() => {
    if (introVideoObjectUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIntroVideoPreview(introVideoObjectUrl);
    } else if (!removeIntroVideo) {
      setIntroVideoPreview(initialValues?.introVideo?.url || null);
    } else {
      setIntroVideoPreview(null);
    }

    return () => {
      if (introVideoObjectUrl) URL.revokeObjectURL(introVideoObjectUrl);
    };
  }, [introVideoObjectUrl, removeIntroVideo, initialValues?.introVideo?.url]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => courseApi.createCourse(data),
    onSuccess: () => {
      toast.success("Course created successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to create course", {
        description: error.response?.data?.message || "Please try again.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) =>
      courseApi.updateCourse(initialValues?._id as string, data),
    onSuccess: () => {
      toast.success("Course updated successfully");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({
        queryKey: ["course", initialValues?._id],
      });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update course", {
        description: error.response?.data?.message || "Please try again.",
      });
    },
  });

  const onSubmit = (values: CourseFormData) => {
    const formData = new FormData();

    // Append form fields
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("instructor", values.instructor);
    formData.append("duration", values.duration || "Unspecified");

    formData.append("isPublished", String(values.isPublished));
    formData.append("isFeatured", String(values.isFeatured));
    formData.append("progressionMode", values.progressionMode);

    values.learningObjectives.forEach((obj, index) => {
      formData.append(`learningObjectives[${index}]`, obj);
    });

    if (thumbnailFile) {
      formData.append("thumbnail", thumbnailFile);
    }

    if (introVideoFile) {
      formData.append("introVideo", introVideoFile);
    }

    if (isEdit && removeThumbnail) {
      formData.append("removeThumbnail", "true");
    }

    if (isEdit && removeIntroVideo) {
      formData.append("removeIntroVideo", "true");
    }

    if (isEdit && initialValues?._id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const resetFormState = () => {
    form.reset();

    setThumbnailFile(null);
    setIntroVideoFile(null);
    setThumbnailPreview(initialValues?.thumbnail?.url || null);
    setIntroVideoPreview(initialValues?.introVideo?.url || null);
    setRemoveThumbnail(false);
    setRemoveIntroVideo(false);
  };

  const handleClose = () => {
    resetFormState();
    setOpen(false);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview(null);
    if (isEdit && initialValues?.thumbnail?.url) {
      setRemoveThumbnail(true);
    }
  };

  const handleRemoveIntroVideo = () => {
    setIntroVideoFile(null);
    setIntroVideoPreview(null);
    if (isEdit && initialValues?.introVideo?.url) {
      setRemoveIntroVideo(true);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetFormState();
    }
    setOpen(isOpen);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-4xl! max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the course information below."
              : "Fill in the details to create a new course."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
              {/* Thumbnail Upload */}
              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Course Thumbnail
                </FieldLabel>
                {thumbnailPreview ? (
                  <div className="relative aspect-video rounded-lg border-2 border-dashed h-full w-full">
                    <Image
                      src={thumbnailPreview}
                      alt="Course thumbnail preview"
                      className="w-full h-full object-contain"
                      width={800}
                      height={450}
                      priority
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={handleRemoveThumbnail}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getThumbnailRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isThumbnailDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input {...getThumbnailInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2 aspect-video">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isThumbnailDragActive
                          ? "Drop the image here..."
                          : "Drag & drop an image, or click to select"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </div>
                )}
              </Field>

              <Field>
                <FieldLabel className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Intro Video
                </FieldLabel>

                {introVideoPreview ? (
                  <div className="relative aspect-video rounded-lg border-2 border-dashed h-full w-full">
                    <video
                      src={introVideoPreview}
                      className="w-full object-contain"
                      controls
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={handleRemoveIntroVideo}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div
                    {...getIntroVideoRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isIntroVideoDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input {...getIntroVideoInputProps()} />
                    <div className="flex flex-col items-center justify-center gap-2 aspect-video">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {isIntroVideoDragActive
                          ? "Drop the intro video here..."
                          : "Drag & drop an intro video, or click to select"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        MP4, MOV, AVI, MKV, WEBM up to 500MB
                      </p>
                    </div>
                  </div>
                )}
              </Field>
            </div>

            {/* Course Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Course Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter course title"
                    aria-invalid={fieldState.invalid}
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
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    {...field}
                    id="description"
                    placeholder="Enter course description"
                    aria-invalid={fieldState.invalid}
                    disabled={isLoading}
                    rows={4}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
              {/* Instructor */}
              <Controller
                name="instructor"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="instructor">Instructor</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || isLoadingInstructors}
                    >
                      <SelectTrigger
                        id="instructor"
                        className={
                          fieldState.invalid ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder="Select an instructor">
                          {selectedInstructorId ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {getSelectedInstructorName(
                                  selectedInstructorId,
                                )}
                              </span>
                            </div>
                          ) : (
                            "Select an instructor"
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingInstructors ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">
                              Loading instructors...
                            </span>
                          </div>
                        ) : !instructors || instructors.length === 0 ? (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No instructors found
                          </div>
                        ) : (
                          instructors.map((instructor) => (
                            <SelectItem
                              key={instructor.id}
                              value={instructor.id}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {instructor.firstName} {instructor.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {instructor.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Duration */}
              <Controller
                name="duration"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Duration</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="cursor-pointer">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4 weeks">4 weeks</SelectItem>
                        <SelectItem value="6 weeks">6 weeks</SelectItem>
                        <SelectItem value="8 weeks">8 weeks</SelectItem>
                        <SelectItem value="3 months">3 months</SelectItem>
                        <SelectItem value="6 months">6 months</SelectItem>
                        <SelectItem value="1 year">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Progression Mode */}
            <Controller
              name="progressionMode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Progression Mode</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">
                        Sequential (Lessons in order)
                      </SelectItem>
                      <SelectItem value="free">
                        Free (Any lesson anytime)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sequential requires completing previous lessons to unlock
                    next ones
                  </p>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Learning Objectives */}
            <Field>
              <FieldLabel>Learning Objectives</FieldLabel>

              <div className="space-y-2">
                {(learningObjectives ?? []).map((objective, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={objective}
                      placeholder={`Objective ${index + 1}`}
                      disabled={isLoading}
                      onChange={(e) => updateObjective(index, e.target.value)}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeObjective(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addObjective}
                  disabled={
                    isLoading || (learningObjectives?.length ?? 0) >= 10
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Objective
                </Button>
              </div>
            </Field>

            {/* Status Toggles */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Controller
                name="isPublished"
                control={form.control}
                render={({ field }) => (
                  <div className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/40 transition-all flex items-start gap-3">
                    <Checkbox
                      id="isPublished"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="isPublished"
                        className="text-sm font-semibold cursor-pointer leading-none"
                      >
                        Published
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Visible to all users
                      </p>
                    </div>
                  </div>
                )}
              />

              <Controller
                name="isFeatured"
                control={form.control}
                render={({ field }) => (
                  <div className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/40 transition-all flex items-start gap-3">
                    <Checkbox
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                    <div className="flex flex-col space-y-1">
                      <label
                        htmlFor="isFeatured"
                        className="text-sm font-semibold cursor-pointer leading-none"
                      >
                        Featured
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Show on homepage
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          </FieldGroup>

          <DialogFooter className="mt-8">
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Course" : "Create Course"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CourseForm;
