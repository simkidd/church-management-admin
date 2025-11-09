"use client";
import { Button } from "@/components/ui/button";
import { IExam } from "@/interfaces/exam.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import examsApi from "@/lib/api/exam.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { EyeOff, FileText, Loader2, Wifi } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

const ExamDetailsQuickActions = ({ exam }: { exam: IExam }) => {
  const queryClient = useQueryClient();

  const togglePublishMutation = useMutation({
    mutationFn: (isPublished: boolean) =>
      examsApi.updateExam(exam._id, { isPublished }),
    onSuccess: (data) => {
      const { exam } = data.data;
      const action = exam.isPublished ? "published" : "unpublished";
      toast.success(`Exam ${action} successfully`, {
        description: `${exam.title} has been ${action}.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["exam", exam._id] });
      queryClient.invalidateQueries({ queryKey: ["allExams"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update exam status. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });

  const handleTogglePublish = () => {
    const currentStatus = exam.isPublished;
    togglePublishMutation.mutate(!currentStatus);
  };

  const isPublishing = togglePublishMutation.isPending;

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* View Submissions */}
      <Button
        variant="outline"
        className="h-24 w-full flex flex-col items-center justify-center gap-2 p-2 square-button"
        asChild
      >
        <Link href={`/dashboard/exams/submissions/${exam._id}`}>
          <FileText />
          <span className="text-xs text-center leading-tight">
            View Submissions
          </span>
        </Link>
      </Button>

      {/* Publish/Unpublish */}
      {exam.isPublished ? (
        <Button
          variant="outline"
          className="h-24 w-full flex flex-col items-center justify-center gap-2 p-2 square-button border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:text-yellow-900"
          onClick={handleTogglePublish}
          disabled={isPublishing}
        >
          {isPublishing ? <Loader2 className="animate-spin" /> : <EyeOff />}
          <span className="text-xs text-center leading-tight">
            {isPublishing ? "Updating..." : "Unpublish Exam"}
          </span>
        </Button>
      ) : (
        <Button
          className="h-24 w-full flex flex-col items-center justify-center gap-2 p-2 square-button bg-green-600 hover:bg-green-700 text-white"
          onClick={handleTogglePublish}
          disabled={isPublishing}
        >
          {isPublishing ? <Loader2 className="animate-spin" /> : <Wifi />}
          <span className="text-xs text-center leading-tight">
            {isPublishing ? "Publishing..." : "Publish Exam"}
          </span>
        </Button>
      )}
    </div>
  );
};

export default ExamDetailsQuickActions;
