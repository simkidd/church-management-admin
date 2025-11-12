import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListCourseParams } from "@/interfaces/course.interface";
import { courseApi } from "@/lib/api/course.api";

//  Fetch all courses
export const useCourses = (params?: ListCourseParams) =>
  useQuery({
    queryKey: ["courses", params],
    queryFn: () => courseApi.getAllCourses(params),
  });

//  Create a new course (Mutation)
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

//  Delete a course (Mutation)
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
