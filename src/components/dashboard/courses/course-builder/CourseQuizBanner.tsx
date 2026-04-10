import { useState } from "react";
import { Edit2, Trash2, Trophy } from "lucide-react";

import { IQuiz, IQuizSummary } from "@/interfaces/quiz.interface";
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

interface CourseQuizBannerProps {
  quiz: IQuizSummary;
  courseId: string;
  onDelete: () => void;
}

export const CourseQuizBanner = ({
  quiz,
  courseId,
  onDelete,
}: CourseQuizBannerProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-lg border bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-900 p-4">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="h-24 w-24 text-amber-600" />
        </div>

        <div className="relative flex sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Trophy className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                  Course Final Exam
                </h3>
                <Badge
                  variant="outline"
                  className="text-xs border-amber-300 text-amber-700 dark:text-amber-300"
                >
                  Course Level
                </Badge>
              </div>

              <p className="text-sm text-amber-700 dark:text-amber-300/80 mt-0.5">
                {quiz.title} • {quiz.questionsCount} questions • Passing:{" "}
                {quiz.passingScore}%
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <QuizForm
              courseId={courseId}
              scopeType="course"
              initialValues={quiz}
              isEdit
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              }
            />

            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Final Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the course final exam. Students will no longer
              need to complete it to finish the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
