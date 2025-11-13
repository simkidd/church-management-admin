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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ICourse } from "@/interfaces/course.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  BookOpen,
  Clock,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const CourseCard = ({ course }: { course: ICourse }) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseApi.deleteCourse(id),
    onSuccess: (data) => {
      toast.success("Success!", {
        description: data.message,
      });

      queryClient.invalidateQueries({ queryKey: ["courses"] });
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

  const handleDelete = () => {
    deleteMutation.mutate(course._id);
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? "Published" : "Draft";
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <>
      <Card
        key={course._id}
        className="hover:shadow-lg transition-shadow border border-muted/20 rounded-2xl py-0 overflow-hidden"
      >
        {course.thumbnail?.url ? (
          <div className="relative aspect-video w-full">
            <Image
              src={course.thumbnail.url}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <Badge
              variant="secondary"
              className={`absolute top-3 right-3 ${getStatusColor(
                course.isPublished
              )}`}
            >
              {getStatusText(course.isPublished)}
            </Badge>
          </div>
        ) : (
          <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <span className="text-sm">No thumbnail</span>
            </div>
            <Badge
              variant="secondary"
              className={`absolute top-3 right-3 ${getStatusColor(
                course.isPublished
              )}`}
            >
              {getStatusText(course.isPublished)}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-semibold leading-tight">
              {course.title}
            </CardTitle>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {course.description}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 h-full pb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course?.lessons?.length || 0} lessons</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration || "N/A"}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 mt-auto">
            <Link href={`/dashboard/courses/${course._id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                View
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 " />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

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
              course
              <span className="font-semibold text-foreground">
                {" "}
                {course.title}{" "}
              </span>
              and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
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
                "Delete Course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseCard;
