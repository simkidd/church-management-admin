// components/dashboard/exams/ExamPreview.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IExam } from "@/interfaces/exam.interface";
import examApi from "@/lib/api/exam.api";
import { ArrowLeft, Clock, Target, FileText } from "lucide-react";
import { formatDuration } from "@/utils/helpers/time";
import { EmptyState } from "@/components/shared/EmptyState";

interface ExamPreviewProps {
  examId: string;
}

export default function ExamPreview({ examId }: ExamPreviewProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { data: examData, isLoading } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => examApi.getExamById(examId),
  });

  const exam = examData?.data as IExam;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!exam) {
    return (
      <EmptyState
        icon={FileText}
        title="Exam Not Found"
        description="The exam you're looking for doesn't exist or you
                      don't have permission to view it."
        action={
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <div className="bg-blue-600 text-white py-4">
        <div className="px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-blue-700"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  Preview Mode - Student View
                </h1>
                <p className="text-blue-100 text-sm">
                  This is how students will see the exam
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-blue-600">
              Preview
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* Exam Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {exam.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Duration: {formatDuration(exam.duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span>Passing Score: {exam.passingScore}%</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Questions: {exam.questions?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Questions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Students will answer these questions in order
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {exam.questions?.map((question, index) => (
              <div key={question._id} className="p-4 border rounded-lg bg-card">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium">{index + 1}</span>
                  </div>
                  <div className="flex-1 space-y-4">
                    {/* Question Text */}
                    <div>
                      <h3 className="font-medium mb-2">
                        {question.questionText}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {question.type} • {question.points} point
                        {question.points !== 1 ? "s" : ""}
                      </Badge>
                    </div>

                    {/* Options for MCQ */}
                    {question.type === "mcq" && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50 cursor-pointer"
                          >
                            <div className="w-4 h-4 border rounded-full border-muted-foreground" />
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* True/False Options */}
                    {question.type === "true-false" && (
                      <div className="space-y-2">
                        {["True", "False"].map((option) => (
                          <div
                            key={option}
                            className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50 cursor-pointer"
                          >
                            <div className="w-4 h-4 border rounded-full border-muted-foreground" />
                            <span className="text-sm">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Short Answer Input */}
                    {question.type === "short-answer" && (
                      <div className="space-y-2">
                        <textarea
                          placeholder="Type your answer here..."
                          className="w-full min-h-20 p-3 border rounded-md resize-none text-sm"
                          disabled
                        />
                        {question.keywords && question.keywords.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Keywords for auto-grading:{" "}
                            {question.keywords.join(", ")}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preview Notice */}
        <Card className="mt-6 border-amber-200 bg-amber-100/50">
          <CardContent className="">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Preview Mode:</strong> This is how students will see the
                exam. You cannot submit answers in preview mode.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
