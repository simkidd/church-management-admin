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
import { IExam } from "@/interfaces/exam.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import examsApi from "@/lib/api/exam.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Edit, Loader2 } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const examBasicInfoSchema = z.object({
  title: z
    .string()
    .min(1, "Exam title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  passingScore: z
    .number()
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score must not exceed 100"),
  isPublished: z.boolean(),
});

type ExamBasicInfoFormData = z.infer<typeof examBasicInfoSchema>;

const EditExamForm = ({ exam }: { exam: IExam }) => {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<ExamBasicInfoFormData>({
    resolver: zodResolver(examBasicInfoSchema),
    defaultValues: {
      title: exam.title,
      duration: exam.duration,
      passingScore: exam.passingScore,
      isPublished: exam.isPublished,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExamBasicInfoFormData) =>
      examsApi.updateExam(exam._id, data),
    onSuccess: (data) => {
      const { exam: updatedExam } = data.data;
      toast.success("Exam updated successfully", {
        description: `${updatedExam.title} has been updated.`,
      });

      queryClient.invalidateQueries({ queryKey: ["exam", exam._id] });
      queryClient.invalidateQueries({ queryKey: ["allExams"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update exam. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });

  const handleEditSubmit = (data: ExamBasicInfoFormData) => {
    updateMutation.mutate(data);
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (open) {
      form.reset({
        title: exam.title,
        duration: exam.duration,
        passingScore: exam.passingScore,
        isPublished: exam.isPublished,
      });
    }
  };

  if ((exam.submissionCount || 0) > 0) {
    return null;
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
          <DialogDescription>
            Update the basic information for this exam. Questions cannot be
            edited here.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleEditSubmit)}>
          <FieldGroup className="space-y-4">
            {/* Title Field */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="title">Exam Title</FieldLabel>
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter exam title"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Duration and Passing Score Fields */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="duration"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="duration">
                      Duration (minutes)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="duration"
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="passingScore"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="passingScore">
                      Passing Score (%)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="passingScore"
                      type="number"
                      min="0"
                      max="100"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Exam"
                )}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExamForm;
