"use client";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ILesson } from "@/interfaces/course.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  MoreVertical,
  Play,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const LessonItem = ({
  lesson,
  courseId,
}: {
  lesson: ILesson;
  courseId: string;
}) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<ILesson | null>(null);
  const [previewLesson, setPreviewLesson] = useState<ILesson | null>(null);

  const deleteMutation = useMutation({
    mutationFn: ({ id, lessonId }: { id: string; lessonId: string }) =>
      courseApi.deleteLesson(id, lessonId),
    onSuccess: (data) => {
      toast.success("Success!", {
        description: data.message,
      });

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete course. Please try again.";
      toast.error("Delete Failed", {
        description: errorMessage,
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDeleteClick = (lesson: ILesson) => {
    setLessonToDelete(lesson);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (lessonToDelete) {
      deleteMutation.mutate({ id: courseId, lessonId: lessonToDelete._id });
    }
  };

  const handlePreviewClick = (lesson: ILesson) => {
    setPreviewLesson(lesson);
  };

  const isDeleting = deleteMutation.isPending;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <>
      <div
        key={lesson._id}
        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{lesson.title}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span>Duration: {formatDuration(lesson.duration || 0)}</span>
              <span>Order: {lesson.order}</span>
              {lesson.video?.url && (
                <Badge variant="outline" className="text-xs">
                  Video
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <MoreVertical className="" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                href={`/dashboard/courses/${courseId}/lessons/${lesson._id}/edit`}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handlePreviewClick(lesson)}
            >
              <Eye className="h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => handleDeleteClick(lesson)}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              lesson
              <span className="font-semibold text-foreground">
                {" "}
                {lesson.title}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin " />
                  Deleting...
                </>
              ) : (
                "Delete Lesson"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewLesson}
        onOpenChange={() => setPreviewLesson(null)}
      >
        <DialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Lesson Preview
            </DialogTitle>
            <DialogDescription>Preview of the lesson content</DialogDescription>
          </DialogHeader>

          {previewLesson && (
            <div className="space-y-6">
              {/* Lesson Header */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {previewLesson.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(previewLesson.duration || 0)}
                      </div>
                      <div>Order: {previewLesson.order}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Preview */}
              {previewLesson.video?.url && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Lesson Video
                  </h3>
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      poster={previewLesson.video.url || undefined}
                      controlsList="nodownload"
                    >
                      <source src={previewLesson.video.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}

              {/* Content Preview */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lesson Content
                </h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {previewLesson.content}
                  </p>
                </div>
              </div>

              {/* Lesson Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Duration</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDuration(previewLesson.duration || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Order</div>
                  <div className="text-sm text-muted-foreground">
                    {previewLesson.order}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LessonItem;
