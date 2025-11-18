"use client";
import { ICourse } from "@/interfaces/course.interface";
import { ApiResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { LessonForm } from "./LessonForm";

const AddLessonComp = ({ courseId }: { courseId: string }) => {
  const { data, isPending, error } = useQuery<ApiResponse<ICourse>>({
    queryKey: ["course", courseId],
    queryFn: () => courseApi.getCourseById(courseId),
  });

  if (isPending) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const course = data?.data;
  const existingLessons = course?.lessons || [];

  return (
    <div>
      <LessonForm courseId={courseId} existingLessons={existingLessons} />
    </div>
  );
};

export default AddLessonComp;
