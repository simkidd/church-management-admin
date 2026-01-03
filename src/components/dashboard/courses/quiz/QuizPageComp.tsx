"use client";

import { IQuizByIdResponse, IQuizQuestion } from "@/interfaces/quiz.interface";
import { ApiErrorResponse, ApiResponse } from "@/interfaces/response.interface";
import { quizApi } from "@/lib/api/quiz.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Trash2,
  Edit2,
  Plus,
  ArrowLeft,
  CheckIcon,
  CheckCircle2Icon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { AxiosError } from "axios";
import QuizQuestionForm from "./QuizQuestionForm";
import Link from "next/link";

interface QuizPageCompProps {
  quizId: string;
}

const QuizPageComp: React.FC<QuizPageCompProps> = ({ quizId }) => {
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery<ApiResponse<IQuizByIdResponse>>({
    queryKey: ["quiz", quizId],
    queryFn: () => quizApi.getQuizById(quizId),
  });

  const quiz = data?.data.quiz;
  const questions = data?.data.questions || [];

  const [editingQuestion, setEditingQuestion] = useState<IQuizQuestion | null>(
    null
  );
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => quizApi.deleteQuizQuestion(id),
    onSuccess: () => {
      toast.success("Question deleted");
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      setDeleteQuestionId(null);
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete question", {
        description: err.response?.data.message,
      });
    },
  });

  if (isPending || !quiz) return <Loader2 className="animate-spin h-6 w-6" />;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/dashboard/courses/${quiz.module.course._id}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
        </div>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>Module: {quiz.module.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Passing Score: {quiz.passingScore}%</p>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Questions</h2>
        <QuizQuestionForm quizId={quiz._id}>
          <Button size="sm" variant="outline">
            <Plus className="mr-1 h-4 w-4" />
            Add Question
          </Button>
        </QuizQuestionForm>
      </div>

      {questions.length === 0 && <p>No questions yet</p>}

      <div className="space-y-2">
        {questions.map((q) => (
          <Card key={q._id}>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="font-medium">{q.question}</p>
                <p className="text-sm text-muted-foreground ">
                  Question type:{" "}
                  {q.type === "mcq"
                    ? "Multiple Choice"
                    : q.type.replace("-", " / ")}
                </p>

                {/* 👇 OPTIONS + CORRECT ANSWER */}
                <QuestionPreview q={q} />
              </div>

              <div className="flex gap-2">
                <QuizQuestionForm quizId={quiz._id} initialValues={q} isEdit>
                  <Button size="icon" variant="ghost">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </QuizQuestionForm>

                <AlertDialog
                  open={deleteQuestionId === q._id}
                  onOpenChange={() => setDeleteQuestionId(null)}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Question</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this question? This
                        action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteMutation.mutate(q._id);
                        }}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDeleteQuestionId(q._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizPageComp;

const QuestionPreview = ({ q }: { q: IQuizQuestion }) => {
  if (q.type === "mcq" && q.options?.length) {
    return (
      <ul className="mt-2 space-y-1">
        {q.options.map((opt, idx) => {
          const isCorrect = idx === q.correctAnswerIndex;

          return (
            <li
              key={idx}
              className={`flex items-center gap-2 text-sm px-2 py-1 rounded
                ${isCorrect ? "font-medium" : "text-muted-foreground"}
              `}
            >
              <span>{opt}</span>
              {isCorrect && (
                <span>
                  <CheckCircle2Icon className="h-4 w-4 text-green-600" />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  if (q.type === "true-false") {
    return (
      <p className="mt-2 text-sm">
        Correct Answer:{" "}
        <span className="font-medium text-green-600">
          {q.correctAnswerIndex === 0 ? "True" : "False"}
        </span>
      </p>
    );
  }

  return null;
};
