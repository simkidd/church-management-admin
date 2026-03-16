import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, HelpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { IQuiz, IQuizSummary } from "@/interfaces/quiz.interface";
import { quizApi } from "@/lib/api/quiz.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import QuizForm from "../quiz/QuizQuestionForm";
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

interface ModuleQuizCardProps {
  quiz: IQuizSummary;
  courseId: string;
  moduleId: string;
}

export const ModuleQuizCard = ({
  quiz,
  courseId,
  moduleId,
}: ModuleQuizCardProps) => {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => quizApi.deleteQuiz(quiz._id),
    onSuccess: () => {
      toast.success("Module quiz deleted");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      setShowDeleteDialog(false);
    },
  });

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-5 w-5 text-amber-600 cursor-pointer" />
          </TooltipTrigger>
          <TooltipContent >
            <p>Module assessment quiz</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex-1">
          <p className="font-medium text-sm text-amber-900 dark:text-amber-100">
            {quiz.title}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300/80">
            Module Quiz • {quiz.questionsCount} questions
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
          <TooltipContent >
            <p>Passing score required</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <QuizForm
              courseId={courseId}
              moduleId={moduleId}
              scopeType="module"
              initialValues={quiz}
              isEdit
              trigger={
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              }
            />
          </TooltipTrigger>
          <TooltipContent >
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
          <TooltipContent >
            <p>Delete quiz</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the quiz from this module.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
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
