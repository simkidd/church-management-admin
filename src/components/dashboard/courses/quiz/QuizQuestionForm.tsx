"use client";

import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
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
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { quizApi } from "@/lib/api/quiz.api";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { IQuizQuestion } from "@/interfaces/quiz.interface";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// --- Zod Schema ---
const questionSchema = z.object({
  question: z.string().min(1, "Question text is required"),
  type: z.enum(["mcq", "true-false"]),
  options: z.array(z.string()).optional(),
  correctAnswerIndex: z.number(),
});

export type QuizQuestionFormData = z.infer<typeof questionSchema>;

interface QuizQuestionFormProps {
  quizId: string;
  children: React.ReactNode;
  initialValues?: IQuizQuestion;
  isEdit?: boolean;
}

const QuizQuestionForm = ({
  quizId,
  children,
  initialValues,
  isEdit,
}: QuizQuestionFormProps) => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<QuizQuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: "",
      type: "mcq",
      options: ["", ""],
      correctAnswerIndex: 0,
    },
  });

  const { control, handleSubmit, reset, setValue } = form;
  const questionType = useWatch({
    control,
    name: "type",
  });

  const correctAnswerIndex = useWatch({
    control,
    name: "correctAnswerIndex",
  });

  // Reset options and correct answer when type changes
  useEffect(() => {
    if (questionType === "mcq") {
      setValue("options", ["", ""]);
      setValue("correctAnswerIndex", 0);
    } else if (questionType === "true-false") {
      setValue("options", ["true", "false"]);
      setValue("correctAnswerIndex", 0);
    }
  }, [questionType, setValue]);

  useEffect(() => {
    if (isDialogOpen && initialValues) {
      reset({
        question: initialValues.question,
        type: initialValues.type,
        options: initialValues.options,
        correctAnswerIndex: initialValues.correctAnswerIndex,
      });
    }

    if (!isDialogOpen && !isEdit) {
      reset();
    }
  }, [isDialogOpen, initialValues, isEdit, reset]);

  // Mutation to add question
  const addQuestionMutation = useMutation({
    mutationFn: (data: QuizQuestionFormData) =>
      quizApi.addQuizQuestion({ quiz: quizId, ...data }),
    onSuccess: () => {
      toast.success("Question added successfully");
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      setIsDialogOpen(false);
      reset();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to add question");
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (data: QuizQuestionFormData) =>
      quizApi.updateQuizQuestion(initialValues!._id, data),
    onSuccess: () => {
      toast.success("Question updated");
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      setIsDialogOpen(false);
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error(err.response?.data.message || "Failed to update question");
    },
  });

  const onSubmit = (data: QuizQuestionFormData) => {
    if (isEdit) {
      updateQuestionMutation.mutate(data);
    } else {
      addQuestionMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-[500px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Question" : "Add New Question"}
          </DialogTitle>
          <DialogDescription>Add a question to this quiz.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)]">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              id="quiz-question-form"
            >
              {/* Question Text */}
              <FormField
                control={control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter question" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question Type */}
              <FormField
                control={control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Options for MCQ */}
              {questionType === "mcq" && (
                <MCQOptions
                  control={control}
                  setValue={setValue}
                  correctAnswerIndex={correctAnswerIndex}
                  disabled={addQuestionMutation.isPending}
                />
              )}

              {/* Correct Answer for True/False */}
              {questionType === "true-false" && (
                <FormField
                  control={control}
                  name="correctAnswerIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correct Answer</FormLabel>
                      <FormControl>
                        <RadioGroup
                          value={String(field.value)}
                          onValueChange={(val) => field.onChange(Number(val))}
                          className="flex gap-6"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="0" />
                            <span>True</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="1" />
                            <span>False</span>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="submit"
            form="quiz-question-form"
            disabled={
              addQuestionMutation.isPending || updateQuestionMutation.isPending
            }
          >
            {addQuestionMutation.isPending ||
            updateQuestionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEdit ? "Updating..." : "Adding..."}
              </>
            ) : isEdit ? (
              "Update Question"
            ) : (
              "Add Question"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// MCQ Options Component
function MCQOptions({
  control,
  setValue,
  correctAnswerIndex,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  setValue: (name: "correctAnswerIndex", value: number) => void;
  correctAnswerIndex: number;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  return (
    <div className="space-y-3">
      <FormLabel>Options</FormLabel>

      <RadioGroup
        value={String(correctAnswerIndex)}
        onValueChange={(val) => setValue("correctAnswerIndex", Number(val))}
        className="space-y-2"
      >
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-3">
            <RadioGroupItem value={String(index)} disabled={disabled} />

            <FormField
              control={control}
              name={`options.${index}`}
              render={({ field }) => (
                <FormControl>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                if (fields.length <= 2) {
                  toast.error("MCQ must have at least 2 options");
                  return;
                }

                remove(index);

                // auto-fix correct answer index if needed
                if (correctAnswerIndex === index) {
                  setValue("correctAnswerIndex", 0);
                }
              }}
              disabled={disabled}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </RadioGroup>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (fields.length >= 5) {
            toast.error("Maximum of 5 options allowed");
            return;
          }
          append("");
        }}
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Option
      </Button>
    </div>
  );
}

export default QuizQuestionForm;
