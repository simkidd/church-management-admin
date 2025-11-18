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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IExam } from "@/interfaces/exam.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import examApi from "@/lib/api/exam.api";
import { formatDuration } from "@/utils/helpers/time";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  FileText,
  BarChart3,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

const CourseExamCard = ({ exam }: { exam: IExam }) => {
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examApi.deleteExam(id),
    onSuccess: (data) => {
      toast.success("Success!", {
        description: data.message,
      });

      queryClient.invalidateQueries({ queryKey: ["allExams"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to delete exam. Please try again.";
      toast.error("Delete Failed", {
        description: errorMessage,
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(exam._id);
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4 sm:gap-2">
        {/* Left Section - Exam Info */}
        <div className="flex items-start  gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title and Badge */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 mb-1">
              <h4 className="font-medium text-base sm:text-lg truncate">
                {exam.title}
              </h4>
              <Badge
                variant={exam.isPublished ? "default" : "secondary"}
                className="shrink-0 w-fit"
              >
                {exam.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            {/* Exam Details */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="whitespace-nowrap">
                Questions: {exam.questions?.length || 0}
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="whitespace-nowrap">
                Duration: {formatDuration(exam.duration)}
              </span>
              <span className="hidden xs:inline">•</span>
              <span className="whitespace-nowrap">
                Passing: {exam.passingScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center justify-end sm:justify-normal gap-1 sm:gap-2 shrink-0">
          {/* Mobile: Stacked buttons */}
          <div className="flex sm:hidden items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="h-8 w-8"
                >
                  <Link href={`/dashboard/exams/${exam._id}/results`}>
                    <BarChart3 className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>See results</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  className="h-8 w-8"
                >
                  <Link href={`/dashboard/exams/${exam._id}`}>
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>
          </div>

          {/* Desktop: Horizontal buttons with text */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/exams/${exam._id}/results`}>
                <BarChart3 className="h-4 w-4" />
                Results
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/exams/${exam._id}`}>
                <Eye className="h-4 w-4" />
                View
              </Link>
            </Button>
          </div>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/dashboard/exams/${exam._id}/preview`}>
                  <Eye className="h-4 w-4" />
                  Preview as Student
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
              exam
              <span className="font-semibold text-foreground">
                {" "}
                {exam.title}{" "}
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
                "Delete Exam"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseExamCard;
