"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moduleApi } from "@/lib/api/module.api";
import { IModule } from "@/interfaces/module.interface";

export const useReorderModules = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (modules: IModule[]) =>
      moduleApi.reorderModule({
        courseId,
        modules: modules.map((m) => ({
          id: m._id,
          order: m.order,
        })),
      }),

    // 🔥 Optimistic update
    onMutate: async (newModules) => {
      await queryClient.cancelQueries({
        queryKey: ["course-modules", courseId],
      });

      const previousModules = queryClient.getQueryData<IModule[]>([
        "course-modules",
        courseId,
      ]);

      queryClient.setQueryData(["course-modules", courseId], newModules);

      return { previousModules };
    },

    // ❌ Rollback on error
    onError: (_err, _vars, context) => {
      if (context?.previousModules) {
        queryClient.setQueryData(
          ["course-modules", courseId],
          context.previousModules
        );
      }
    },

    // ✅ Revalidate
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-modules", courseId],
      });
    },
  });
};
