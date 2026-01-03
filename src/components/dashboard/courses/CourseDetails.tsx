"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ICourse } from "@/interfaces/course.interface";
import courseApi from "@/lib/api/course.api";

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ArrowLeft,
  BookOpen,
  Edit,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";

import { IModuleWithLessons } from "@/interfaces/module.interface";
import { ApiErrorResponse, ApiResponse } from "@/interfaces/response.interface";
import { AxiosError } from "axios";
import { CourseBuilderTab } from "./CourseBuilderTab";
import { CourseDetailsSkeleton } from "./CourseDetailsSkeleton";
import CourseForm from "./CourseForm";
import { CourseDetailsOverviewTab } from "./CourseDetailsOverviewTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

const CourseBuilderPage = ({ courseId }: { courseId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  /** Fetch course info */
  const {
    data: courseData,
    isPending: isCourseLoading,
    error: courseError,
  } = useQuery<ApiResponse<ICourse>>({
    queryKey: ["course", courseId],
    queryFn: () => courseApi.getCourseById(courseId),
  });

  /** Fetch modules + lessons */
  const { data: modulesData, isPending: isModulesLoading } = useQuery<
    ApiResponse<{
      course: ICourse;
      modules: IModuleWithLessons[];
    }>
  >({
    queryKey: ["course-modules", courseId],
    queryFn: () => courseApi.getCourseModules(courseId),
    enabled: !!courseData,
  });

  const course = courseData?.data as ICourse;
  const modules = modulesData?.data?.modules ?? [];

  // Publish / Unpublish Mutation
  const togglePublishMutation = useMutation({
    mutationFn: (isPublished: boolean) => {
      const formData = new FormData();
      formData.append("isPublished", isPublished.toString());
      return courseApi.updateCourse(course?._id, formData);
    },
    onSuccess: (data) => {
      const action = data.data.course.isPublished ? "published" : "unpublished";
      toast.success(`Course ${action} successfully`, {
        description: `${data.data.course.title} has been ${action}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["course", course?._id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["courses-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["course-modules", course._id] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Update Failed", {
        description:
          error.response?.data?.message || "Failed to update course status.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseApi.deleteCourse(id),
    onSuccess: (data) => {
      toast.success("Success!", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsDeleteDialogOpen(false);
      router.push("/dashboard/courses");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Delete Failed", {
        description:
          error.response?.data?.message || "Failed to delete course.",
      });
      setIsDeleteDialogOpen(false);
    },
  });

  const handleTogglePublish = () =>
    togglePublishMutation.mutate(!course?.isPublished);
  const handleDelete = () => deleteMutation.mutate(course._id);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Create new URL with updated tab parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);

    // Update URL without page reload
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (isCourseLoading) return <CourseDetailsSkeleton />;
  if (courseError || !course)
    return (
      <div className="">
        <EmptyState
          icon={BookOpen}
          title="Course Not Found"
          description="The course you're looking for doesn't exist or you
                don't have permission to view it."
          action={
            <Button asChild>
              <Link href={"/dashboard/courses"}>Back to Courses</Link>
            </Button>
          }
        />
      </div>
    );

  const isPublishing = togglePublishMutation.isPending;
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

          {/* Course Header with Thumbnail */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-start gap-6">
                {/* Thumbnail */}
                <div className="shrink-0">
                  {course.thumbnail?.url ? (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                      <Image
                        src={course.thumbnail.url}
                        alt={course.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Course Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold capitalize">
                      {course.title}
                    </h1>
                    {isPublishing && (
                      <Badge variant="secondary" className="animate-pulse">
                        Updating...
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">
                    {course.description}
                  </p>
                </div>
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
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="builder">Course Builder</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <CourseDetailsOverviewTab course={course} />
              </TabsContent>

              <TabsContent value="builder" className="mt-6">
                <CourseBuilderTab
                  modules={modules}
                  lessons={modules.flatMap((m) => m.lessons || [])}
                  courseId={course._id}
                  loading={isModulesLoading}
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

export default CourseBuilderPage;
