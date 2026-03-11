"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
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
  GraduationCap,
  ListTodo,
  Lock,
  Unlock,
  Files,
  LayoutDashboard,
  ClipboardList,
  Layers3,
  Clock3,
  CalendarDays,
} from "lucide-react";

import { ApiErrorResponse, ApiResponse } from "@/interfaces/response.interface";
import { AxiosError } from "axios";
import { CourseBuilderTab } from "./course-builder/CourseBuilderTab";
import { CourseDetailsSkeleton } from "./CourseDetailsSkeleton";
import CourseForm from "./CourseForm";
import { CourseDetailsOverviewTab } from "./CourseDetailsOverviewTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { IModuleWithState } from "@/interfaces/module.interface";
import CourseLearningMaterialsTab from "./learning-materials/CourseLearningMaterialsTab";
import { IQuizSummary } from "@/interfaces/quiz.interface";

const CourseBuilderPage = ({ courseId }: { courseId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const urlTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(urlTab || "overview");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: courseData,
    isPending: isCourseLoading,
    error: courseError,
  } = useQuery<ApiResponse<ICourse>>({
    queryKey: ["course", courseId],
    queryFn: () => courseApi.getCourseById(courseId),
  });

  const { data: modulesData, isPending: isModulesLoading } = useQuery<
    ApiResponse<{
      course: ICourse;
      modules: IModuleWithState[];
      quiz: IQuizSummary | null;
    }>
  >({
    queryKey: ["course-modules", courseId],
    queryFn: () => courseApi.getCourseModules(courseId),
    enabled: !!courseData,
  });

  const course = courseData?.data;
  const modules = modulesData?.data?.modules ?? [];
  const courseQuiz = modulesData?.data?.quiz ?? null;

  // Calculate stats
  const stats = useMemo(() => {
    const totalLessons = modules.reduce(
      (acc, module) => acc + (module.lessons?.length || 0),
      0,
    );

    const totalQuizzes =
      modules.reduce((acc, module) => {
        const lessonQuizzes =
          module.lessons?.filter((lesson) => lesson.quiz).length || 0;
        const moduleQuiz = module.quiz ? 1 : 0;
        return acc + lessonQuizzes + moduleQuiz;
      }, 0) + (courseQuiz ? 1 : 0);

    return {
      modulesCount: modules.length,
      totalLessons,
      totalQuizzes,
    };
  }, [modules, courseQuiz]);

  const togglePublishMutation = useMutation({
    mutationFn: (isPublished: boolean) => {
      const formData = new FormData();
      formData.append("isPublished", isPublished.toString());
      return courseApi.updateCourse(course?._id as string, formData);
    },
    onSuccess: (data) => {
      const action = data.data.isPublished ? "published" : "unpublished";
      toast.success(`Course ${action} successfully`);
      queryClient.invalidateQueries({ queryKey: ["course", course?._id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
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
    },
  });

  const handleTogglePublish = () =>
    togglePublishMutation.mutate(!course?.isPublished);
  const handleDelete = () => deleteMutation.mutate(course!._id);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (isCourseLoading) return <CourseDetailsSkeleton />;
  if (courseError || !course)
    return (
      <EmptyState
        icon={BookOpen}
        title="Course Not Found"
        description="The course you're looking for doesn't exist or you don't have permission to view it."
        action={
          <Button asChild>
            <Link href="/dashboard/courses">Back to Courses</Link>
          </Button>
        }
      />
    );

  const isPublishing = togglePublishMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-6">
        {/* Top bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>

            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage this course, its structure, and learner-facing content.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleTogglePublish}
              disabled={isPublishing}
              className="gap-2"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : course.isPublished ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}

              {isPublishing
                ? course.isPublished
                  ? "Unpublishing..."
                  : "Publishing..."
                : course.isPublished
                  ? "Unpublish"
                  : "Publish"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <CourseForm initialValues={course} isEdit>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                </CourseForm>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Modules</p>
                <p className="font-semibold">{stats.modulesCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lessons</p>
                <p className="font-semibold">{stats.totalLessons}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quizzes</p>
                <p className="font-semibold">{stats.totalQuizzes}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-semibold">
                  {format(new Date(course.createdAt!), "MMM d, yyyy")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full h-auto flex flex-wrap justify-start  ">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>

          <TabsTrigger
            value="builder"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Content Builder
          </TabsTrigger>

          <TabsTrigger
            value="materials"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border"
          >
            <Files className="h-4 w-4 mr-2" />
            Learning Materials
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-2">
          <CourseDetailsOverviewTab course={course} />
        </TabsContent>

        <TabsContent value="builder" className="mt-2">
          <CourseBuilderTab
            modules={modules}
            courseId={course._id}
            loading={isModulesLoading}
            progressionMode={course.progressionMode}
            courseQuiz={courseQuiz}
          />
        </TabsContent>

        <TabsContent value="materials" className="mt-2">
          <CourseLearningMaterialsTab
            course={course}
            modules={modules}
            loading={isModulesLoading}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{course.title}</strong> and
              all its modules, lessons, and quizzes. This action cannot be
              undone.
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
