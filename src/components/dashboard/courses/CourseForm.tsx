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
import { Loader2, Upload, X, User } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Controller, useForm, useWatch } from "react-hook-form";
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
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialValues?.thumbnail?.url || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    },
  });

  const selectedInstructorId = useWatch({
    control: form.control,
    name: "instructor",
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
          toast.error("File is too large. Maximum size is 5MB.");
        } else {
          toast.error("Invalid file type. Please use JPEG, PNG, or WEBP.");
        }
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    },
  });

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
    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    // Append image file if exists
    if (imageFile) {
      formData.append("thumbnail", imageFile);
    }

    if (isEdit && initialValues?._id) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    form.reset();
    setPreviewImage(initialValues?.thumbnail?.url || null);
    setImageFile(null);
    setOpen(false);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageFile(null);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      setPreviewImage(initialValues?.thumbnail?.url || null);
      setImageFile(null);
    }
    setOpen(isOpen);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
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

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Thumbnail Upload */}
            <Field>
              <FieldLabel>Course Thumbnail</FieldLabel>
              {previewImage ? (
                <div className="relative aspect-video rounded-lg border-2 border-dashed">
                  <Image
                    src={previewImage}
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
                    onClick={handleRemoveImage}
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
                      className={fieldState.invalid ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Select an instructor">
                        {selectedInstructorId ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {getSelectedInstructorName(selectedInstructorId)}
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
                          <SelectItem key={instructor.id} value={instructor.id}>
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

            {/* Published Status */}
            <Controller
              name="isPublished"
              control={form.control}
              render={({ field }) => (
                <div className="border rounded-xl p-4 bg-muted/30 hover:bg-muted/40 transition-all flex items-start gap-3">
                  <Checkbox
                    id="isPublished"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="mt-0.5 h-5 w-5 border-primary text-primary data-[state=checked]:bg-primary"
                  />
                  <div className="flex flex-col space-y-1">
                    <label
                      htmlFor="isPublished"
                      className="text-sm font-semibold cursor-pointer leading-none"
                    >
                      Publish course immediately
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Once published, the course will be visible to all users on
                      the platform.
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
