import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ILesson } from "@/interfaces/course.interface";
import { EmptyState } from "@/components/shared/EmptyState";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import courseApi from "@/lib/api/course.api";
import { useState } from "react";
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

interface LessonsTabProps {
  lessons: ILesson[];
  courseId: string;
}

export const LessonsTab = ({ lessons, courseId }: LessonsTabProps) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<ILesson | null>(null);

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

  const isDeleting = deleteMutation.isPending;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Course Lessons</CardTitle>
        <Button asChild>
          <Link href={`/dashboard/courses/${courseId}/lessons/new`}>
            <Plus className="h-4 w-4" />
            Add Lesson
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No lesson yet"
              description="Get started by adding your first lesson"
            />
          ) : (
            lessons.map((lesson) => (
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
                        <span>
                          Duration: {formatDuration(lesson.duration || 0)}
                        </span>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer"
                      >
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
                      <DropdownMenuItem className="cursor-pointer">
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
                        This action cannot be undone. This will permanently
                        delete the lesson
                        <span className="font-semibold text-foreground">
                          {" "}
                          {lesson.title}
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                      </AlertDialogCancel>
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
              </>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
