import { ICourse, ListCourseParams } from "@/interfaces/course.interface";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import { courseApi } from "@/lib/api/course.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useCourses = (params?: ListCourseParams) => {
  const { data, isPending, isError, refetch } = useQuery<
    ApiResponse<PaginatedResponse<ICourse>>
  >({
    queryKey: ["courses", params],
    queryFn: async () => courseApi.getAllCourses(params),
  });

  const { courses, totalCourses, totalPages } = useMemo(() => {
    if (!data || isPending || isError)
      return { courses: [], totalCourses: 0, totalPages: 0 };

    return {
      courses: data.data.data || [],
      totalCourses: data.data.pagination.totalItems || 0,
      totalPages: data.data.pagination.totalPages || 0,
    };
  }, [data, isPending, isError]);

  return {
    courses,
    totalCourses,
    totalPages,
    isPending,
    isError,
    refetch,
  };
};

export default useCourses;
