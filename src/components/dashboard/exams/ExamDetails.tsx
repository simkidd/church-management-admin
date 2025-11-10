"use client";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IExam } from "@/interfaces/exam.interface";
import { ApiResponse } from "@/interfaces/response.interface";
import examsApi from "@/lib/api/exam.api";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  FileQuestion,
  FileText,
  Target,
  User,
} from "lucide-react";
import Link from "next/link";
import ExamActions from "./ExamActions";
import ExamDetailsQuickActions from "./ExamDetailsQuickActions";
import { ExamDetailsSkeleton } from "./ExamDetailsSkeleton";
import ExamQuestionsList from "./ExamQuestionsList";

const ExamDetails = ({ id }: { id: string }) => {
  const { data, isLoading, error } = useQuery<ApiResponse<IExam>>({
    queryKey: ["exam", id],
    queryFn: () => examsApi.getExamById(id),
  });

  const exam = data?.data;

  if (isLoading) {
    return <ExamDetailsSkeleton />;
  }

  if (error || !exam) {
    return (
      <div className="">
        <EmptyState
          icon={FileQuestion}
          title="Exam Not Found"
          description="The exam you're looking for doesn't exist or you
              don't have permission to view it."
        />
      </div>
    );
  }

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? "Published" : "Draft";
  };

  const calculateTotalPoints = () => {
    return (
      exam.questions?.reduce((total, question) => total + question.points, 0) ||
      0
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/exams">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
          </div>
        </div>

        <ExamActions exam={exam} />
      </div>

      {/* Exam Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.duration} min</div>
            <p className="text-xs text-muted-foreground">Total exam time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passing Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exam.passingScore}%</div>
            <p className="text-xs text-muted-foreground">Minimum to pass</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {exam.questions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateTotalPoints()}</div>
            <p className="text-xs text-muted-foreground">Maximum score</p>
          </CardContent>
        </Card>
      </div>

      {/* Exam Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Exam Information</CardTitle>
            <CardDescription>Basic details about the exam</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Course
                </label>
                <p className="text-sm font-medium">{exam.course?.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(exam.isPublished)}
                  >
                    {getStatusText(exam.isPublished)}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Instructor
                </label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {exam.course?.instructor?.firstName}{" "}
                    {exam.course?.instructor?.lastName}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">
                  {format(new Date(exam.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage this exam</CardDescription>
          </CardHeader>
          <CardContent>
            <ExamDetailsQuickActions exam={exam} />
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({exam.questions?.length || 0})</CardTitle>
          <CardDescription>All questions in this exam</CardDescription>
        </CardHeader>
        <CardContent>
          <ExamQuestionsList exam={exam} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamDetails;
