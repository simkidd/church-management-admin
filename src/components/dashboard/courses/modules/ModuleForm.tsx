"use client";

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
import { moduleApi } from "@/lib/api/module.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2, BookOpen, FileText, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Simplified schema - no order
const moduleFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  isPublished: z.boolean(),
});

type ModuleFormData = z.infer<typeof moduleFormSchema>;

interface ModuleFormProps {
  courseId: string;
  initialValues?: Partial<ModuleFormData & { _id: string; order: number }>;
  children?: React.ReactNode;
  isEdit?: boolean;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  courseId,
  initialValues,
  children,
  isEdit = false,
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      title: "",
      description: "",
      isPublished: false,
    },
  });

  // Reset form when opening
  useEffect(() => {
    if (open && initialValues) {
      form.reset({
        title: initialValues.title || "",
        description: initialValues.description || "",
        isPublished: initialValues.isPublished || false,
      });
    }
  }, [initialValues, open, form]);

  const createMutation = useMutation({
    mutationFn: (data: ModuleFormData) =>
      moduleApi.createModule({
        ...data,
        course: courseId,
      }),
    onSuccess: () => {
      toast.success("Module created successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to create module", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ModuleFormData) =>
      moduleApi.updateModule(initialValues?._id as string, {
        ...data,
        // Don't send order on update either
      }),
    onSuccess: () => {
      toast.success("Module updated successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update module", {
        description: error.response?.data?.message || "Please try again",
      });
    },
  });

  const onSubmit = (values: ModuleFormData) => {
    if (isEdit && initialValues?._id) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px]"
        onInteractOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEdit ? "Edit Module" : "Add New Module"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update module details."
              : "Create a new module. Order is assigned automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Module Title *</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="e.g., Introduction to React"
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
                    placeholder="What this module covers..."
                    disabled={isLoading}
                    rows={3}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Published */}
            <Controller
              name="isPublished"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 mt-2">
                  <Checkbox
                    id="isPublished"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                  <div className="space-y-1">
                    <label
                      htmlFor="isPublished"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Publish immediately
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Unpublished modules are only visible to instructors
                    </p>
                  </div>
                </div>
              )}
            />
          </FieldGroup>

          <DialogFooter className="gap-2 mt-4">
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
                  {isEdit ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Save Changes" : "Create Module"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleForm;
