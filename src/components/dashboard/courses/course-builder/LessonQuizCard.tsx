import React, { useState } from "react";
import QuizForm from "../quiz/QuizQuestionForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, HelpCircle, Trash2 } from "lucide-react";
import { ILessonWithState } from "@/interfaces/lesson.interface";
import { IQuizSummary } from "@/interfaces/quiz.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { quizApi } from "@/lib/api/quiz.api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { AxiosError } from "axios";

interface LessonQuizCardProps {
  quiz: IQuizSummary;
  lesson: ILessonWithState;
  lessonIndex: number;
  courseId: string;
  moduleId: string;
}

const LessonQuizCard = ({
  quiz,
  lesson,
  lessonIndex,
  courseId,
  moduleId,
}: LessonQuizCardProps) => {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => quizApi.deleteQuiz(quiz._id),
    onSuccess: () => {
      toast.success("Module quiz deleted");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      setShowDeleteDialog(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete lesson quiz", {
        description: error.response?.data?.message,
      });
    },
  });
  return (
    <>
      <div className="ml-8 flex items-center gap-2 p-2 rounded-md bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50">
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-amber-500 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Lesson assessment quiz</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            {quiz.title}
          </p>

          <p className="text-xs text-amber-700 dark:text-amber-300/80">
            Lesson {lessonIndex + 1} Assessment • {quiz.questionsCount}{" "}
            question(s)
          </p>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-xs border-amber-300 cursor-default"
            >
              Pass: {quiz.passingScore}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Passing score required</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <QuizForm
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lesson._id}
              scopeType="lesson"
              initialValues={quiz}
              isEdit
              trigger={
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Edit2 className="h-3 w-3" />
                </Button>
              }
            />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Edit quiz</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Delete quiz</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the quiz from this lesson.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LessonQuizCard;
