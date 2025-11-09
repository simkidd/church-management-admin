"use client";

import {
  Control,
  useFieldArray,
  useForm,
  useFormContext,
  UseFormWatch,
  useWatch,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { toast } from "sonner";
import examsApi from "@/lib/api/exam.api";
import { CreateExamData } from "@/interfaces/exam.interface";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Trash2 } from "lucide-react";
import api from "@/lib/axios";
import { ICourse } from "@/interfaces/course.interface";
import { useEffect } from "react";

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

const examSchema = z.object({
  title: z
    .string()
    .min(1, "Exam title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),
  course: z.string().min(1, "Course is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  passingScore: z
    .number()
    .min(0, "Passing score must be at least 0")
    .max(100, "Passing score must not exceed 100"),
  isPublished: z.boolean(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
});

type ExamFormData = z.infer<typeof examSchema>;

export default function ExamForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch courses for dropdown
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await api.get("/courses");
      return response.data;
    },
  });

  const courses = coursesData?.data.data || [];

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      course: "",
      duration: 60,
      passingScore: 70,
      isPublished: false,
      questions: [
        {
          questionText: "",
          type: "mcq",
          points: 1,
          order: 1,
          options: undefined,
          correctAnswer: undefined,
          keywords: [],
        },
      ],
    },
  });

  const { control, handleSubmit, watch, formState } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: (data: ExamFormData) =>
      examsApi.createExam(data as CreateExamData),
    onSuccess: (data) => {
      const { exam } = data.data;
      toast.success("Exam created successfully", {
        description: `${exam.title} has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: ["allExams"] });
      router.push("/dashboard/exams");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create exam. Please try again.";

      toast.error("Create Exam Failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = async (data: ExamFormData) => {
    console.log("Form data:", data);
    createExamMutation.mutate(data);
  };

  const addQuestion = () => {
    const newOrder = fields.length + 1;
    append({
      questionText: "",
      type: "mcq",
      points: 1,
      order: newOrder,
      options: ["", "", "", ""],
      correctAnswer: "",
      keywords: [],
    });
  };

  const removeQuestion = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error("Cannot remove last question");
    }
  };

  const isLoading = createExamMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Exam Basic Information */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Exam Information</h2>

          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exam Title</FormLabel>
                <FormControl>
                  <Input placeholder="Final JavaScript Exam" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course: ICourse) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="passingScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Score (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Publish exam immediately</FormLabel>
                    <FormDescription>
                      The exam will be visible to students if published.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions</h2>
          </div>

          {fields.map((field, index) => (
            <QuestionField
              key={field.id}
              control={control}
              watch={watch}
              index={index}
              onRemove={() => removeQuestion(index)}
              disabled={isLoading}
            />
          ))}

          {formState.errors.questions && (
            <FormMessage>{formState.errors.questions.message}</FormMessage>
          )}

          <div className="w-full">
            <Button
              type="button"
              onClick={addQuestion}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/exams")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || isLoadingCourses}
            className="min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Exam"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// 🧩 Question Field Subcomponent
interface QuestionFieldProps {
  control: Control<ExamFormData>;
  watch: UseFormWatch<ExamFormData>;
  index: number;
  onRemove: () => void;
  disabled?: boolean;
}

function QuestionField({
  control,
  watch,
  index,
  onRemove,
  disabled,
}: QuestionFieldProps) {
  const { setValue } = useFormContext<ExamFormData>();
  const questionType = useWatch({
    control,
    name: `questions.${index}.type`,
  });

  // Reset dependent fields when type changes
  useEffect(() => {
    if (questionType === "mcq") {
      setValue(`questions.${index}.options`, []);
      setValue(`questions.${index}.correctAnswer`, undefined);
      setValue(`questions.${index}.keywords`, []);
    } else if (questionType === "true-false") {
      setValue(`questions.${index}.options`, []);
      setValue(`questions.${index}.correctAnswer`, undefined);
      setValue(`questions.${index}.keywords`, []);
    } else if (questionType === "short-answer") {
      setValue(`questions.${index}.options`, []);
      setValue(`questions.${index}.correctAnswer`, undefined);
      setValue(`questions.${index}.keywords`, [""]);
    }
  }, [questionType, index, setValue]);

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-muted/50">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Question {index + 1}</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <FormField
        control={control}
        name={`questions.${index}.questionText`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Question Text</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter your question here..."
                {...field}
                disabled={disabled}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={`questions.${index}.type`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mcq">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`questions.${index}.points`}
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
                  disabled={disabled}
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
        name={`questions.${index}.order`}
        render={({ field }) => (
          <FormControl>
            <Input type="hidden" {...field} />
          </FormControl>
        )}
      />

      {/* Conditional fields based on question type */}
      {questionType === "mcq" && (
        <MCQFields control={control} index={index} disabled={disabled} />
      )}

      {questionType === "true-false" && (
        <TrueFalseFields control={control} index={index} disabled={disabled} />
      )}

      {questionType === "short-answer" && (
        <ShortAnswerFields
          control={control}
          index={index}
          disabled={disabled}
        />
      )}
    </div>
  );
}

// MCQ Fields Component
// MCQ Fields Component with enhanced validation
function MCQFields({
  control,
  index,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  index: number;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const watchOptions = useWatch({
    control,
    name: `questions.${index}.options`,
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
            name={`questions.${index}.options.${optionIndex}`}
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
        disabled={disabled || fields.length === 4}
      >
        <Plus className="h-4 w-4" />
        Add Option
      </Button>

      <FormField
        control={control}
        name={`questions.${index}.correctAnswer`}
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
  index,
  disabled,
}: {
  control: Control<ExamFormData>;
  index: number;
  disabled?: boolean;
}) {
  return (
    <FormField
      control={control}
      name={`questions.${index}.correctAnswer`}
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
  index,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  index: number;
  disabled?: boolean;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${index}.keywords`,
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
            name={`questions.${index}.keywords.${keywordIndex}`}
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
