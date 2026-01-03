"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ILesson } from "@/interfaces/lesson.interface";
import LessonForm from "./LessonForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonApi } from "@/lib/api/lesson.api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface LessonCardProps {
  lesson: ILesson;
  moduleId: string;
  courseId: string;
}

export default function LessonCard({
  lesson,
  moduleId,
  courseId,
}: LessonCardProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => lessonApi.delete(lesson._id),
    onSuccess: (data) => {
      toast.success(data.message || "Lesson deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["lessons", moduleId] });
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete lesson", {
        description: error.response?.data.message,
      });
    },
  });

  return (
    <div className="flex justify-between items-center p-2 border rounded-md bg-background">
      <div className="flex items-center gap-2">
        <span>{lesson.order}.</span>
        <span className="font-medium">{lesson.title}</span>
      </div>

      <div className="flex gap-2">
        <LessonForm
          moduleId={moduleId}
          courseId={courseId}
          lessonId={lesson._id}
          initialValues={lesson}
        >
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </LessonForm>

        {/* Delete with confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="destructive">
              Delete
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The lesson will be permanently
                removed from this module.
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
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin " />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
