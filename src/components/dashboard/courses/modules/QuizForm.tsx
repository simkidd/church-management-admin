"use client";

import { useState } from "react";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api/quiz.api";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IQuiz } from "@/interfaces/quiz.interface";
import { useRouter } from "next/navigation";

// Validation schema
const quizFormSchema = z.object({
  passingScore: z
    .number()
    .min(1, "Passing score must be at least 1")
    .max(100, "Passing score cannot exceed 100"),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  moduleId: string;
  quizId?: string;
  children?: React.ReactNode;
  isEdit?: boolean;
  initialValues?: IQuiz;
}

export default function QuizForm({
  moduleId,
  quizId,
  children,
  isEdit = false,
  initialValues,
}: QuizFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: { passingScore: initialValues?.passingScore || 70 },
  });

  // Create or update quiz
  const saveMutation = useMutation({
    mutationFn: (data: QuizFormData) =>
      isEdit
        ? quizApi.updateQuiz(quizId!, data)
        : quizApi.createQuiz({ module: moduleId, ...data }),
    onSuccess: (data) => {
      toast.success(isEdit ? "Quiz updated" : "Quiz created");
      queryClient.invalidateQueries({ queryKey: ["quiz", moduleId] });
      handleClose();
      router.push(`/dashboard/courses/quiz/${data.data._id}`);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to save quiz", {
        description: error.response?.data?.message,
      });
    },
  });

  // Delete quiz
  const deleteMutation = useMutation({
    mutationFn: () => quizApi.deleteQuiz(quizId!),
    onSuccess: () => {
      toast.success("Quiz deleted");
      queryClient.invalidateQueries({ queryKey: ["course-modules"] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete quiz", {
        description: error.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: QuizFormData) => {
    saveMutation.mutate(values);
  };

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const isLoading = saveMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="secondary">
            {isEdit ? "Edit Quiz" : "Add Quiz"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Quiz" : "Add Quiz"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the passing score for this module quiz."
              : "Set the passing score for the module quiz."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="passingScore"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="passingScore">Passing Score</FieldLabel>
                  <Input
                    type="number"
                    {...field}
                    id="passingScore"
                    placeholder="Enter passing score"
                    disabled={isLoading}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter className="mt-4 flex gap-2 justify-end">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={isLoading}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEdit ? "Update Quiz" : "Create Quiz"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
