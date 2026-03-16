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
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/helpers/time";
import {
  ILessonWithQuiz,
  ILessonWithState,
} from "@/interfaces/lesson.interface";
import { lessonApi } from "@/lib/api/lesson.api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LessonForm from "../lessons/LessonForm";
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
import LessonQuizCard from "./LessonQuizCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { AxiosError } from "axios";

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
        return <PlayCircle className="h-4 w-4" />;
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
          "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-md bg-card border shadow-sm",
          isDragging && "opacity-50 shadow-md ring-2 ring-primary",
          !lesson.isPublished && "border-dashed opacity-75",
        )}
      >
        {/* Top row: Drag handle, Icon, Title, Badges, Actions */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                {...attributes}
                {...listeners}
                className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none shrink-0"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Drag to reorder</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 rounded-md bg-muted cursor-default shrink-0">
                {getLessonIcon()}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getLessonTypeLabel()}</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground shrink-0">
                L{lessonIndex + 1}
              </span>
              <span className="font-medium text-sm truncate">
                {lesson.title}
              </span>

              <div className="flex items-center gap-1 flex-shrink-0">
                {lesson.isPreview && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 cursor-default"
                      >
                        Preview
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Free preview available</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {!lesson.isPublished && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 cursor-default"
                      >
                        Draft
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Not published yet</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {lesson.quiz && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-amber-500 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Has quiz</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          {/* Actions - on mobile: below title, on desktop: right side */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 ml-auto">
            {!lesson.quiz && (
              <Tooltip>
                <TooltipTrigger>
                  <QuizForm
                    courseId={courseId}
                    moduleId={moduleId}
                    lessonId={lesson._id}
                    scopeType="lesson"
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-amber-500"
                      >
                        <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    }
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add quiz</p>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger>
                <LessonForm
                  moduleId={moduleId}
                  courseId={courseId}
                  initialValues={lesson}
                  isEdit
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 sm:h-7 sm:w-7 p-0"
                  >
                    <Edit2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </LessonForm>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit lesson</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 sm:h-7 sm:w-7 p-0 text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete lesson</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Bottom row: Metadata (type, duration, quiz) - full width on mobile */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground sm:pl-0 pl-9">
          <span className="capitalize">{lesson.type}</span>
          {!!lesson.durationSeconds && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(lesson.durationSeconds)}
              </span>
            </>
          )}
          {lesson.quiz && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="text-amber-600">Has Quiz</span>
            </>
          )}
        </div>
      </div>

      {lesson.quiz && (
        <LessonQuizCard
          lesson={lesson}
          quiz={lesson.quiz}
          lessonIndex={lessonIndex}
          courseId={courseId}
          moduleId={moduleId}
        />
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
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
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
              className="bg-destructive text-destructive-foreground w-full sm:w-auto"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
