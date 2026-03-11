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

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-md bg-card border shadow-sm",
          isDragging && "opacity-50 shadow-md ring-2 ring-primary",
          !lesson.isPublished && "border-dashed opacity-75",
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="p-2 rounded-md bg-muted">{getLessonIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">
              L{lessonIndex + 1}
            </span>
            <span className="font-medium text-sm truncate">{lesson.title}</span>

            {lesson.isPreview && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Preview
              </Badge>
            )}

            {!lesson.isPublished && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                Draft
              </Badge>
            )}

            {lesson.quiz && <HelpCircle className="h-3 w-3 text-amber-500" />}
          </div>

          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span className="capitalize">{lesson.type}</span>
            {!!lesson.durationSeconds && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.durationSeconds)}
                </span>
              </>
            )}
            {lesson.quiz && (
              <>
                <span>•</span>
                <span className="text-amber-600">Has Quiz</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!lesson.quiz && (
            <QuizForm
              courseId={courseId}
              moduleId={moduleId}
              lessonId={lesson._id}
              scopeType="lesson"
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-amber-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              }
            />
          )}

          <LessonForm
            moduleId={moduleId}
            courseId={courseId}
            initialValues={lesson}
            isEdit
          >
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </LessonForm>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{lesson.title}</strong>
              {lesson.quiz ? " and its associated quiz" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
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
