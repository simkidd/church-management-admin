import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import {
  Clock,
  Edit2,
  FileText,
  GripVertical,
  Headphones,
  HelpCircle,
  Plus,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/helpers/time";
import { lessonApi } from "@/lib/api/lesson.api";
import type { ILessonWithState } from "@/interfaces/lesson.interface";
import type { ApiErrorResponse } from "@/interfaces/response.interface";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LessonForm from "../lessons/LessonForm";
import QuizForm from "../quiz/QuizQuestionForm";
import LessonQuizCard from "./LessonQuizCard";
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

interface SortableLessonItemProps {
  lesson: ILessonWithState;
  lessonIndex: number;
  moduleId: string;
  courseId: string;
}

export const SortableLessonItem = ({
  lesson,
  lessonIndex,
  moduleId,
  courseId,
}: SortableLessonItemProps) => {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deleteMutation = useMutation({
    mutationFn: () => lessonApi.delete(lesson._id),
    onSuccess: () => {
      toast.success("Lesson deleted");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      setShowDeleteDialog(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete lesson", {
        description: error.response?.data?.message,
      });
    },
  });

  const getLessonIcon = () => {
    switch (lesson.type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case "audio":
        return <Headphones className="h-4 w-4 text-purple-500" />;
      case "article":
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLessonTypeLabel = () => {
    switch (lesson.type) {
      case "video":
        return "Video lesson";
      case "audio":
        return "Audio lesson";
      case "article":
        return "Article lesson";
      default:
        return "Lesson";
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-xl border bg-card shadow-sm transition-all",
          isDragging && "opacity-70 ring-2 ring-primary shadow-lg",
          !lesson.isPublished && "border-dashed",
        )}
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex shrink-0 items-center gap-2 pt-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      {...attributes}
                      {...listeners}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Drag to reorder</p>
                  </TooltipContent>
                </Tooltip>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                  {getLessonIcon()}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[11px]">
                    L{lessonIndex + 1}
                  </Badge>

                  <h4 className="min-w-0 break-words text-sm font-semibold sm:text-[15px]">
                    {lesson.title}
                  </h4>

                  {lesson.isPreview && (
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      Preview
                    </Badge>
                  )}

                  {!lesson.isPublished && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      Draft
                    </Badge>
                  )}

                  {lesson.quiz && (
                    <Badge className="gap-1 bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300">
                      <HelpCircle className="h-3 w-3" />
                      Quiz
                    </Badge>
                  )}
                </div>

                {lesson.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {lesson.description}
                  </p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{getLessonTypeLabel()}</span>

                  {!!lesson.durationSeconds && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(lesson.durationSeconds)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-1 whitespace-nowrap pl-2">
              {!lesson.quiz && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <QuizForm
                        courseId={courseId}
                        moduleId={moduleId}
                        lessonId={lesson._id}
                        scopeType="lesson"
                        trigger={
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-amber-500"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add lesson quiz</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <LessonForm
                      moduleId={moduleId}
                      courseId={courseId}
                      initialValues={lesson}
                      isEdit
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </LessonForm>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit lesson</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete lesson</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {lesson.quiz && (
        <div className="mt-2">
          <LessonQuizCard
            lesson={lesson}
            quiz={lesson.quiz}
            lessonIndex={lessonIndex}
            courseId={courseId}
            moduleId={moduleId}
          />
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{lesson.title}</strong>
              {lesson.quiz ? " and its associated quiz" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="w-full bg-destructive text-destructive-foreground sm:w-auto"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};