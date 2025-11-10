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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { IExam } from "@/interfaces/exam.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import examsApi from "@/lib/api/exam.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Edit, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";

interface ExamActionsProps {
  exam: IExam;
}

const ExamActions = ({ exam }: ExamActionsProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examsApi.deleteExam(id),
    onSuccess: (data) => {
      toast.success("Success!", {
        description: data.message,
      });

      // Invalidate queries and redirect
      queryClient.invalidateQueries({ queryKey: ["allExams"] });

      router.push("/dashboard/exams");
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

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      <Button asChild variant="outline" size="sm">
        <Link href={`/dashboard/exams/${exam._id}/edit`}>
          <Edit className="h-4 w-4 " />
          Edit
        </Link>
      </Button>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4 " />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this exam?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              exam <span className="font-bold">{exam.title}</span> and all its
              associated data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All questions and answers</li>
                <li>Student submissions and results</li>
                <li>Exam statistics and analytics</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete exam"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamActions;
