"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  LayoutList,
  Loader2,
  Plus,
  Settings,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Control,
  Controller,
  useFieldArray,
  useForm,
  useFormState,
  useWatch,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import {
  CreateQuizPayload,
  IQuiz,
  QuizQuestionType,
  UpdateQuizPayload,
} from "@/interfaces/quiz.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { quizApi } from "@/lib/api/quiz.api";

const QUESTION_TYPES = [
  "single-choice",
  "multiple-choice",
  "true-false",
] as const;

type QuestionType = QuizQuestionType;

const quizOptionSchema = z.object({
  text: z.string().min(1, "Option text required"),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z
  .object({
    question: z.string().min(1, "Question required"),
    type: z.enum(QUESTION_TYPES),
    options: z.array(quizOptionSchema),
    explanation: z.string().optional(),
  })
  .superRefine((question, ctx) => {
    if (question.type === "true-false") {
      if (question.options.length !== 2) {
        ctx.addIssue({
          code: "custom",
          message: "True/False questions must have exactly 2 options",
          path: ["options"],
        });
      }

      const labels = question.options.map((o) => o.text.trim().toLowerCase());

      if (labels[0] !== "true" || labels[1] !== "false") {
        ctx.addIssue({
          code: "custom",
          message: 'True/False options must be "True" and "False"',
          path: ["options"],
        });
      }
    } else if (question.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        message: "At least 2 options required",
        path: ["options"],
      });
    }

    const correctCount = question.options.filter((o) => o.isCorrect).length;

    if (
      (question.type === "single-choice" || question.type === "true-false") &&
      correctCount !== 1
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Exactly one correct option is required",
        path: ["options"],
      });
    }

    if (question.type === "multiple-choice" && correctCount < 1) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one correct option",
        path: ["options"],
      });
    }
  });

const quizFormSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().max(500).optional(),
  scopeType: z.enum(["lesson", "module", "course"]),
  passingScore: z.number().min(0).max(100),
  shuffleQuestions: z.boolean(),
  showResultsImmediately: z.boolean(),
  gradingMode: z.enum(["auto", "manual"]),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "At least one question required"),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  scopeType: "lesson" | "module" | "course";
  initialValues?: Partial<IQuiz>;
  isEdit?: boolean;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const getDefaultOptionsForType = (type: QuestionType) => {
  if (type === "true-false") {
    return [
      { text: "True", isCorrect: false },
      { text: "False", isCorrect: false },
    ];
  }

  return [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ];
};

const normalizeQuestionForType = (
  type: QuestionType,
  options: Array<{ text: string; isCorrect: boolean }>,
) => {
  if (type === "true-false") {
    const trueOption = options.find(
      (o) => o.text.trim().toLowerCase() === "true",
    );
    const falseOption = options.find(
      (o) => o.text.trim().toLowerCase() === "false",
    );

    return [
      { text: "True", isCorrect: trueOption?.isCorrect ?? false },
      { text: "False", isCorrect: falseOption?.isCorrect ?? false },
    ];
  }

  if (type === "single-choice") {
    let foundOne = false;

    return options.map((option) => {
      if (option.isCorrect && !foundOne) {
        foundOne = true;
        return option;
      }

      if (option.isCorrect && foundOne) {
        return { ...option, isCorrect: false };
      }

      return option;
    });
  }

  return options;
};

const getFormValuesFromQuiz = (
  quiz: Partial<IQuiz> | undefined,
  fallbackScopeType: "lesson" | "module" | "course",
): QuizFormData => ({
  title: quiz?.title || "",
  description: quiz?.description || "",
  scopeType:
    (quiz?.scopeType as "lesson" | "module" | "course") || fallbackScopeType,
  passingScore: quiz?.passingScore || 70,
  shuffleQuestions: quiz?.shuffleQuestions || false,
  showResultsImmediately: quiz?.showResultsImmediately ?? true,
  gradingMode: quiz?.gradingMode || "auto",
  questions: quiz?.questions?.map((q) => ({
    question: q.question,
    type: q.type as QuestionType,
    options: normalizeQuestionForType(
      q.type as QuestionType,
      q.options.map((o) => ({
        text: o.text,
        isCorrect: Boolean(o.isCorrect),
      })),
    ),
    explanation: q.explanation || "",
  })) || [
    {
      question: "",
      type: "single-choice",
      options: getDefaultOptionsForType("single-choice"),
      explanation: "",
    },
  ],
});

export const QuizForm: React.FC<QuizFormProps> = ({
  courseId,
  moduleId,
  lessonId,
  scopeType,
  initialValues,
  isEdit = false,
  trigger,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const quizId = initialValues?._id;

  const { data: quizDetailsResponse, isFetching: isFetchingQuiz } = useQuery({
    queryKey: ["quiz", quizId],
    queryFn: () => quizApi.getQuizById(quizId as string),
    enabled: open && isEdit && !!quizId,
    staleTime: 1000 * 60 * 5,
  });

  const fullQuiz = quizDetailsResponse?.data;

  const defaultValues = useMemo(
    () => getFormValuesFromQuiz(initialValues, scopeType),
    [initialValues, scopeType],
  );

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      if (fullQuiz) {
        form.reset(getFormValuesFromQuiz(fullQuiz, scopeType));
      }
      return;
    }

    form.reset(getFormValuesFromQuiz(initialValues, scopeType));
  }, [open, isEdit, fullQuiz, initialValues, scopeType, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateQuizPayload) => quizApi.createQuiz(data),
    onSuccess: () => {
      toast.success("Quiz created successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to create quiz", {
        description: error.response?.data?.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateQuizPayload) =>
      quizApi.updateQuiz(initialValues?._id as string, data),
    onSuccess: () => {
      toast.success("Quiz updated successfully");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      handleClose();
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to update quiz", {
        description: error.response?.data?.message,
      });
    },
  });

  const onSubmit = (values: QuizFormData) => {
    const normalizedQuestions = values.questions.map((question) => ({
      ...question,
      options: normalizeQuestionForType(question.type, question.options),
    }));

    if (isEdit) {
      const resolvedQuizId = fullQuiz?._id || initialValues?._id;

      if (!resolvedQuizId) {
        toast.error("Quiz ID not found");
        return;
      }

      const payload: UpdateQuizPayload = {
        title: values.title,
        description: values.description,
        gradingMode: values.gradingMode,
        passingScore: values.passingScore,
        shuffleQuestions: values.shuffleQuestions,
        showResultsImmediately: values.showResultsImmediately,
        questions: normalizedQuestions,
      };

      updateMutation.mutate(payload);
      return;
    }

    const payload: CreateQuizPayload = {
      course: courseId,
      module: moduleId || null,
      lesson: lessonId || null,
      title: values.title,
      description: values.description,
      scopeType: values.scopeType,
      gradingMode: values.gradingMode,
      passingScore: values.passingScore,
      shuffleQuestions: values.shuffleQuestions,
      showResultsImmediately: values.showResultsImmediately,
      questions: normalizedQuestions,
    };

    createMutation.mutate(payload);
  };

  const handleClose = () => {
    form.reset(getFormValuesFromQuiz(initialValues, scopeType));
    setOpen(false);
  };

  const addQuestion = () => {
    append({
      question: "",
      type: "single-choice",
      options: getDefaultOptionsForType("single-choice"),
      explanation: "",
    });
  };

  const getScopeLabel = () => {
    switch (scopeType) {
      case "course":
        return "Course Final Exam";
      case "module":
        return "Module Assessment";
      case "lesson":
        return "Lesson Check";
      default:
        return "Quiz";
    }
  };

  const getScopeColor = () => {
    switch (scopeType) {
      case "course":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      case "module":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "lesson":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-muted text-foreground";
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const showEditSkeleton = isEdit && open && isFetchingQuiz && !fullQuiz;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>{trigger || children}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="sm:max-w-[920px] max-h-[92vh] overflow-hidden p-0"
      >
        <div className="flex h-full max-h-[92vh] flex-col">
          <div className="border-b bg-background/95 px-6 py-5 backdrop-blur supports-backdrop-filter:bg-background/80">
            <DialogHeader className="space-y-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-xl p-2.5 shadow-sm",
                      getScopeColor(),
                    )}
                  >
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>
                    <DialogTitle className="text-xl font-semibold tracking-tight">
                      {isEdit ? "Edit Quiz" : "Create Quiz"}
                    </DialogTitle>

                    <DialogDescription className="mt-1 flex items-center gap-2 text-sm">
                      <span>{getScopeLabel()}</span>
                      <Badge variant="outline" className="capitalize">
                        {scopeType}
                      </Badge>
                    </DialogDescription>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <Badge variant="secondary">
                    {fields.length} question{fields.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {showEditSkeleton ? (
              <QuizFormSkeleton />
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <Tabs defaultValue="questions" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/70 p-1">
                    <TabsTrigger value="questions" className="rounded-lg">
                      <LayoutList className="mr-2 h-4 w-4" />
                      Questions ({fields.length})
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="questions" className="mt-5 space-y-5">
                    <Card className="rounded-2xl border shadow-sm">
                      <CardContent className="space-y-4 pt-6">
                        <Controller
                          name="title"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Quiz Title *</FieldLabel>
                              <Input
                                {...field}
                                placeholder="e.g. Module 1 Assessment"
                                disabled={isLoading}
                                className="h-11"
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name="description"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel>Description</FieldLabel>
                              <Textarea
                                {...field}
                                placeholder="Add short instructions or context for learners..."
                                disabled={isLoading}
                                rows={3}
                                className="resize-none"
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      <AnimatePresence initial={false}>
                        {fields.map((field, index) => (
                          <QuestionCard
                            key={field.id}
                            index={index}
                            control={form.control}
                            onRemove={() => remove(index)}
                            isLoading={isLoading}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addQuestion}
                      disabled={isLoading}
                      className="h-11 w-full rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Question
                    </Button>
                  </TabsContent>

                  <TabsContent value="settings" className="mt-5 space-y-4">
                    <Card className="rounded-2xl border shadow-sm">
                      <CardContent className="space-y-6 pt-6">
                        <Controller
                          name="passingScore"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                Passing Score (%)
                              </FieldLabel>
                              <Input
                                type="number"
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value),
                                  )
                                }
                                min={0}
                                max={100}
                                disabled={isLoading}
                                className="h-11"
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />

                        <Controller
                          name="gradingMode"
                          control={form.control}
                          render={({ field }) => (
                            <Field>
                              <FieldLabel>Grading Mode</FieldLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isLoading}
                              >
                                <SelectTrigger className="h-11">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="auto">
                                    Automatic
                                  </SelectItem>
                                  <SelectItem value="manual">
                                    Manual Review
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </Field>
                          )}
                        />

                        <Separator />

                        <div className="space-y-4">
                          <Controller
                            name="shuffleQuestions"
                            control={form.control}
                            render={({ field }) => (
                              <div className="flex items-start gap-3 rounded-xl border p-4">
                                <Checkbox
                                  id="shuffleQuestions"
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(Boolean(checked))
                                  }
                                  disabled={isLoading}
                                />
                                <div>
                                  <label
                                    htmlFor="shuffleQuestions"
                                    className="font-medium cursor-pointer"
                                  >
                                    Shuffle Questions
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    Randomize question order for each learner
                                  </p>
                                </div>
                              </div>
                            )}
                          />

                          <Controller
                            name="showResultsImmediately"
                            control={form.control}
                            render={({ field }) => (
                              <div className="flex items-start gap-3 rounded-xl border p-4">
                                <Checkbox
                                  id="showResultsImmediately"
                                  checked={field.value}
                                  onCheckedChange={(checked) =>
                                    field.onChange(Boolean(checked))
                                  }
                                  disabled={isLoading}
                                />
                                <div>
                                  <label
                                    htmlFor="showResultsImmediately"
                                    className="font-medium cursor-pointer"
                                  >
                                    Show Results Immediately
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    Learners see score and feedback right after
                                    submission
                                  </p>
                                </div>
                              </div>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="sticky bottom-0 z-10 -mx-6 border-t bg-background/95 px-6 py-4 backdrop-blur supports-backdrop-filter:bg-background/80">
                  <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isEdit ? "Saving..." : "Creating..."}
                        </>
                      ) : (
                        <>{isEdit ? "Save Quiz" : "Create Quiz"}</>
                      )}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

type QuestionCardProps = {
  index: number;
  control: Control<QuizFormData>;
  onRemove: () => void;
  isLoading: boolean;
};

const QuestionCard = ({
  index,
  control,
  onRemove,
  isLoading,
}: QuestionCardProps) => {
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    replace,
  } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  }) as QuestionType;

  const options = useWatch({
    control,
    name: `questions.${index}.options`,
  }) as Array<{ text: string; isCorrect: boolean }> | undefined;

  const questionTitle = useWatch({
    control,
    name: `questions.${index}.question`,
  }) as string | undefined;

  useEffect(() => {
    const currentOptions = options ?? [];

    if (questionType === "true-false") {
      const normalized = normalizeQuestionForType("true-false", currentOptions);
      const same =
        normalized.length === currentOptions.length &&
        normalized.every(
          (opt, i) =>
            opt.text === currentOptions[i]?.text &&
            opt.isCorrect === currentOptions[i]?.isCorrect,
        );

      if (!same) replace(normalized);
      return;
    }

    if (questionType === "single-choice") {
      const normalized = normalizeQuestionForType(
        "single-choice",
        currentOptions,
      );
      const same =
        normalized.length === currentOptions.length &&
        normalized.every(
          (opt, i) =>
            opt.text === currentOptions[i]?.text &&
            opt.isCorrect === currentOptions[i]?.isCorrect,
        );

      if (!same) replace(normalized);
    }
  }, [questionType, options, replace]);

  const addOption = () => {
    appendOption({ text: "", isCorrect: false });
  };

  const handleCorrectChange = (optionIndex: number, checked: boolean) => {
    if (questionType === "multiple-choice") return;

    const next = (options ?? []).map((option, index) => ({
      ...option,
      isCorrect: index === optionIndex ? Boolean(checked) : false,
    }));

    replace(next);
  };

  const { errors } = useFormState({ control });
  const optionError = errors?.questions?.[index]?.options?.message as
    | string
    | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="border-b px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted font-mono text-sm font-bold">
              Q{index + 1}
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium">
                {questionTitle?.trim() || `Untitled Question ${index + 1}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {questionType === "single-choice" && "Single choice"}
                {questionType === "multiple-choice" && "Multiple choice"}
                {questionType === "true-false" && "True / False"}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={isLoading}
            className="h-8 w-8 shrink-0 p-0 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <Controller
          name={`questions.${index}.question`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Question *</FieldLabel>
              <Textarea
                {...field}
                placeholder="Enter your question..."
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name={`questions.${index}.type`}
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel>Question Type</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "single-choice", label: "Single Choice" },
                  { value: "multiple-choice", label: "Multiple Choice" },
                  { value: "true-false", label: "True / False" },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    disabled={isLoading}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                      field.value === type.value
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background hover:bg-muted",
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </Field>
          )}
        />

        <div className="space-y-3">
          <FieldLabel>
            Options *
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {questionType === "multiple-choice"
                ? "Select one or more correct answers"
                : "Select exactly one correct answer"}
            </span>
          </FieldLabel>

          <div className="space-y-2">
            {optionFields.map((option, optionIndex) => (
              <div
                key={option.id}
                className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2"
              >
                <Controller
                  name={`questions.${index}.options.${optionIndex}.isCorrect`}
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        if (questionType === "multiple-choice") {
                          field.onChange(Boolean(checked));
                        } else {
                          handleCorrectChange(optionIndex, Boolean(checked));
                        }
                      }}
                      disabled={isLoading}
                    />
                  )}
                />

                <Controller
                  name={`questions.${index}.options.${optionIndex}.text`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={
                        questionType === "true-false"
                          ? optionIndex === 0
                            ? "True"
                            : "False"
                          : `Option ${optionIndex + 1}`
                      }
                      disabled={isLoading || questionType === "true-false"}
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                    />
                  )}
                />

                {questionType !== "true-false" && optionFields.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(optionIndex)}
                    disabled={isLoading}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {optionError && (
            <p className="text-sm text-destructive">{optionError}</p>
          )}

          {questionType !== "true-false" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={isLoading}
              className="rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add Option
            </Button>
          )}
        </div>

        <Controller
          name={`questions.${index}.explanation`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Explanation</FieldLabel>
              <Textarea
                {...field}
                placeholder="Explain the correct answer or add teaching context..."
                disabled={isLoading}
                rows={3}
                className="resize-none"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </motion.div>
  );
};

export default QuizForm;

const QuizFormSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="grid w-full grid-cols-2 gap-2">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-md shrink-0" />

              <div className="flex-1 space-y-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-20 w-full" />

                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-28 rounded-md" />
                    <Skeleton className="h-9 w-32 rounded-md" />
                    <Skeleton className="h-9 w-28 rounded-md" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  {Array.from({ length: 3 }).map((_, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-sm" />
                      <Skeleton className="h-10 flex-1" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
};
