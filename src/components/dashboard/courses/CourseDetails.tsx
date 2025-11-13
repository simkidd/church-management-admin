"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ICourse } from "@/interfaces/course.interface";
import { ApiErrorResponse, ApiResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CourseDetailsAnalyticsTab } from "./CourseDetailAnalyticsTab";
import { CourseDetailsOverviewTab } from "./CourseDetailsOverviewTab";
import { CourseDetailsSkeleton } from "./CourseDetailsSkeleton";
import { EnrolledStudentsTab } from "./EnrolledStudentsTab";
import { LessonsTab } from "./LessonsTab";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { format } from "date-fns";
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
import CourseForm from "./CourseForm";

const CourseDetails = ({ courseId }: { courseId: string }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data, isPending, error } = useQuery<ApiResponse<ICourse>>({
    queryKey: ["course", courseId],
    queryFn: () => courseApi.getCourseById(courseId),
  });

  const course = data?.data as ICourse;

  const togglePublishMutation = useMutation({
    mutationFn: (isPublished: boolean) => {
      const formData = new FormData();
      formData.append("isPublished", isPublished.toString());
      return courseApi.updateCourse(course._id, formData);
    },
    onSuccess: (data) => {
      const { course } = data.data;
      const action = course.isPublished ? "published" : "unpublished";
      toast.success(`Exam ${action} successfully`, {
        description: `${course.title} has been ${action}.`,
      });

      queryClient.invalidateQueries({ queryKey: ["course", course._id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update course status. Please try again.";
      toast.error("Update Failed", {
        description: errorMessage,
      });
    },
  });

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

  const handleTogglePublish = () => {
    const currentStatus = course.isPublished;
    togglePublishMutation.mutate(!currentStatus);
  };

  const isPublishing = togglePublishMutation.isPending;

  if (isPending) {
    return <CourseDetailsSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="">
        <EmptyState
          icon={BookOpen}
          title="Course Not Found"
          description="The courser you're looking for doesn't exist or you
                don't have permission to view it."
        />
      </div>
    );
  }

  const isDeleting = deleteMutation.isPending;

  return (
    <div className="w-full">
      <div className="w-full">
        {/* Header with Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleTogglePublish}
                className="flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {course.isPublished ? "Unpublishing..." : "Publishing..."}
                  </>
                ) : course.isPublished ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <CourseForm initialValues={course} isEdit={true}>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Course
                    </DropdownMenuItem>
                  </CourseForm>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{course.title}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={course.isPublished ? "default" : "secondary"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Students
                  </span>
                  <span className="font-medium">
                    {course.enrolledStudents?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lessons</span>
                  <span className="font-medium">
                    {course.lessons?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium text-sm">
                    {format(new Date(course.createdAt!), "MMM dd, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>

            {course.instructor && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Instructor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary text-sm">
                        {course.instructor.firstName[0]}
                        {course.instructor.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {course.instructor.firstName}{" "}
                        {course.instructor.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {course.instructor.email}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <CourseDetailsOverviewTab course={course} />
              </TabsContent>

              <TabsContent value="lessons" className="mt-6">
                <LessonsTab
                  lessons={course.lessons || []}
                  courseId={course._id}
                />
              </TabsContent>

              <TabsContent value="students" className="mt-6">
                <EnrolledStudentsTab students={course.enrolledStudents || []} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <CourseDetailsAnalyticsTab
                  totalStudents={course.enrolledStudents?.length || 0}
                />
              </TabsContent>
            </Tabs>
          </div>
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
    </div>
  );
};

export default CourseDetails;
