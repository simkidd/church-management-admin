// hooks/useReorderLessons.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonApi } from "@/lib/api/lesson.api";

export const useReorderLessons = (moduleId: string, courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lessons: { id: string; order: number }[]) =>
      lessonApi.reorderLesson({ moduleId, lessons }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
    },
  });
};
