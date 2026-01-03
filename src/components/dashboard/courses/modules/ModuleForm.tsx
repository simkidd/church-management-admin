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
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { moduleApi } from "@/lib/api/module.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Validation schema
const moduleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  order: z.number().min(1, "Order must be at least 1"),
});

type ModuleFormData = z.infer<typeof moduleFormSchema>;

interface ModuleFormProps {
  courseId: string;
  initialValues?: Partial<ModuleFormData & { _id: string }>;
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
      title: initialValues?.title || "",
      order: initialValues?.order || 1,
    },
  });

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
        description: error.response?.data?.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ModuleFormData) =>
      moduleApi.updateModule(initialValues?._id as string, data),
    onSuccess: () => {
      toast.success("Module updated successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update module", {
        description: error.response?.data.message,
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
        className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Module" : "Add New Module"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the module details below."
              : "Fill in the details to add a new module."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Module Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Module Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter module title"
                    disabled={isLoading}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Module Order */}
            <Controller
              name="order"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="order">Module Order</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    id="order"
                    placeholder="Enter module order"
                    disabled={isLoading || isEdit}
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-4">
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
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Module" : "Create Module"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleForm;
