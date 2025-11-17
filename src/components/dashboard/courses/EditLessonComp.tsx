"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ICourse, ILesson } from "@/interfaces/course.interface";
import { ApiResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { LessonForm } from "./LessonForm";
import { Skeleton } from "@/components/ui/skeleton";

const EditLessonComp = ({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) => {
  const {
    data: courseData,
    isPending: courseLoading,
    error: courseError,
  } = useQuery<ApiResponse<ICourse>>({
    queryKey: ["course", courseId],
    queryFn: () => courseApi.getCourseById(courseId),
  });

  if (courseLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (courseError || !courseData?.data) {
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
  }

  const course = courseData.data;
  const existingLessons = course.lessons || [];

  // Find the specific lesson from the course's lessons array
  const lesson = existingLessons.find(
    (lesson: ILesson) => lesson._id === lessonId
  );

  if (!lesson) {
    return (
      <EmptyState
        icon={BookOpen}
        title="Lesson Not Found"
        description="The lesson you're looking for doesn't exist or you don't have permission to view it."
        action={
          <Button asChild>
            <Link href={`/dashboard/courses/${courseId}?tab=lessons`}>
              Back to Lessons
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <LessonForm
        courseId={courseId}
        existingLessons={existingLessons}
        initialData={lesson}
        lessonId={lessonId}
        isEdit={true}
      />
    </div>
  );
};

export default EditLessonComp;
