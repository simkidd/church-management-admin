"use client";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { IExam, IQuestion } from "@/interfaces/exam.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import examsApi from "@/lib/api/exam.api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { error } from "console";
import { ScrollArea } from "@/components/ui/scroll-area";

// Question schema matching your validation
const questionSchema = z
  .object({
    questionText: z.string().min(1, "Question text is required"),
    type: z.enum(["mcq", "true-false", "short-answer"], {
      error: "Please select a question type",
    }),
    points: z.number().min(1, "Points must be at least 1"),
    order: z.number().min(1, "Order must be at least 1"),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    keywords: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // Validate MCQ options
    if (data.type === "mcq") {
      const validOptions =
        data.options?.filter((opt) => opt.trim().length > 0) || [];

      if (validOptions.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "MCQ questions must have at least 2 non-empty options",
          path: ["options"],
        });
      }

      // Validate that correct answer matches one of the non-empty options
      if (data.correctAnswer && validOptions.length > 0) {
        const isValidAnswer = validOptions.includes(data.correctAnswer);
        if (!isValidAnswer) {
          ctx.addIssue({
            code: "custom",
            message: "Correct answer must match one of the provided options",
            path: ["correctAnswer"],
          });
        }
      }
    }

    // Validate correct answer for MCQ and True/False
    if (
      (data.type === "mcq" || data.type === "true-false") &&
      (!data.correctAnswer || data.correctAnswer.trim().length === 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Correct answer is required for MCQ and True/False questions",
        path: ["correctAnswer"],
      });
    }

    // Validate True/False correct answer values
    if (data.type === "true-false" && data.correctAnswer) {
      const validAnswers = ["true", "false"];
      if (!validAnswers.includes(data.correctAnswer.toLowerCase())) {
        ctx.addIssue({
          code: "custom",
          message: "Correct answer must be either 'true' or 'false'",
          path: ["correctAnswer"],
        });
      }
    }
  });

type QuestionFormData = z.infer<typeof questionSchema>;

interface EditQuestionFormProps {
  exam: IExam;
  question: IQuestion;
}

const EditQuestionForm = ({ exam, question }: EditQuestionFormProps) => {
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionText: question.questionText,
      type: question.type,
      points: question.points,
      order: question.order || 1,
      options: question.options || [],
      correctAnswer: question.correctAnswer || "",
      keywords: question.keywords || [],
    },
  });

  const { control, handleSubmit, reset, watch, setValue } = form;
  const questionType = watch("type");

  // Reset dependent fields when type changes
  useEffect(() => {
    if (isEditDialogOpen) {
      if (questionType === "mcq") {
        setValue("options", question.options || []);
        setValue("keywords", []);
      } else if (questionType === "true-false") {
        setValue("options", []);
        setValue("keywords", []);
      } else if (questionType === "short-answer") {
        setValue("options", []);
      }
    }
  }, [questionType, isEditDialogOpen, setValue, question.options]);

  const updateQuestionMutation = useMutation({
    mutationFn: (data: QuestionFormData) =>
      examsApi.updateQuestion(exam._id, question._id, data),
    onSuccess: (data) => {
      const { exam: updatedExam } = data.data;
      toast.success("Question updated successfully", {
        description: "The question has been updated.",
      });

      queryClient.invalidateQueries({ queryKey: ["exam", exam._id] });
      setIsEditDialogOpen(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update question. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });

  const handleQuestionSubmit = (data: QuestionFormData) => {
    updateQuestionMutation.mutate(data);
  };

  const handleEditDialogOpen = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (open) {
      reset({
        questionText: question.questionText,
        type: question.type,
        points: question.points,
        order: question.order || 1,
        options: question.options || [],
        correctAnswer: question.correctAnswer || "",
        keywords: question.keywords || [],
      });
    }
  };

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[500px]! max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Update the question information.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-200px)]">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(handleQuestionSubmit)}
              className="space-y-4"
              id="question-form"
            >
              <FormField
                control={control}
                name="questionText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your question here..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="mcq">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="short-answer">
                            Short Answer
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Points</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hidden order field */}
              <FormField
                control={control}
                name="order"
                render={({ field }) => (
                  <FormControl>
                    <Input type="hidden" {...field} />
                  </FormControl>
                )}
              />

              {/* Conditional fields based on question type */}
              {questionType === "mcq" && (
                <MCQFields
                  control={control}
                  disabled={updateQuestionMutation.isPending}
                />
              )}

              {questionType === "true-false" && (
                <TrueFalseFields
                  control={control}
                  disabled={updateQuestionMutation.isPending}
                />
              )}

              {questionType === "short-answer" && (
                <ShortAnswerFields
                  control={control}
                  disabled={updateQuestionMutation.isPending}
                />
              )}
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditDialogOpen(false)}
            disabled={updateQuestionMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="question-form"
            disabled={updateQuestionMutation.isPending}
          >
            {updateQuestionMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Question"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// MCQ Fields Component
function MCQFields({
  control,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const watchOptions = useWatch({
    control,
    name: "options",
  });

  // Count valid (non-empty) options
  const validOptionsCount =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    watchOptions?.filter((opt: any) => opt.trim().length > 0).length || 0;

  const handleAddOption = () => {
    append("");
  };

  const handleRemoveOption = (optionIndex: number) => {
    if (fields.length > 2) {
      remove(optionIndex);
    } else {
      toast.error("MCQ questions must have at least 2 options");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel>Options</FormLabel>
        <div className="text-sm text-muted-foreground">
          {validOptionsCount}/2 minimum
        </div>
      </div>

      {validOptionsCount < 2 && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          MCQ questions must have at least 2 non-empty options
        </div>
      )}

      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex gap-2 items-center">
          <FormField
            control={control}
            name={`options.${optionIndex}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder={`Option ${optionIndex + 1}`}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveOption(optionIndex)}
            disabled={disabled || fields.length <= 2}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddOption}
        disabled={disabled || fields.length >= 6}
      >
        <Plus className="h-4 w-4" />
        Add Option
      </Button>

      <FormField
        control={control}
        name="correctAnswer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Correct Answer</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter the correct option text"
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormDescription>
              Enter the exact text of one of the options above
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// True/False Fields Component
function TrueFalseFields({
  control,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name="correctAnswer"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Correct Answer</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select correct answer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Short Answer Fields Component
function ShortAnswerFields({
  control,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "keywords",
  });

  return (
    <div className="space-y-3">
      <FormLabel>Keywords (for auto-grading)</FormLabel>
      <FormDescription>
        Add keywords that should be present in the answer. If no keywords are
        provided, this question will require manual grading.
      </FormDescription>

      {fields.map((field, keywordIndex) => (
        <div key={field.id} className="flex gap-2 items-center">
          <FormField
            control={control}
            name={`keywords.${keywordIndex}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder={`Keyword ${keywordIndex + 1}`}
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(keywordIndex)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append("")}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Add Keyword
      </Button>
    </div>
  );
}

export default EditQuestionForm;
