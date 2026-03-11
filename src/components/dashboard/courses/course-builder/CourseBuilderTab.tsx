"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ApiErrorResponse } from "@/interfaces/response.interface";
import { ILesson, ILessonWithQuiz, ILessonWithState } from "@/interfaces/lesson.interface";
import { IModule, IModuleWithLessons, IModuleWithState } from "@/interfaces/module.interface";
import { lessonApi } from "@/lib/api/lesson.api";
import { moduleApi } from "@/lib/api/module.api";
import { quizApi } from "@/lib/api/quiz.api";

import { CourseBuilderHeader } from "./CourseBuilderHeader";
import { CourseBuilderSkeleton } from "./CourseBuilderSkeleton";
import { CourseQuizBanner } from "./CourseQuizBanner";
import { EmptyState } from "./EmptyState";
import { ModuleDragOverlay, LessonDragOverlay } from "./DragOverlays";
import { SortableModuleItem } from "./SortableModuleItem";
import { IQuizSummary } from "@/interfaces/quiz.interface";

interface CourseBuilderTabProps {
  modules: IModuleWithState[];
  courseId: string;
  loading: boolean;
  progressionMode?: "free" | "sequential";
  courseQuiz?: IQuizSummary | null;
}

export type DragItem = {
  type: "module" | "lesson";
  id: string;
  data: IModule | ILesson;
};

export const CourseBuilderTab: React.FC<CourseBuilderTabProps> = ({
  modules,
  courseId,
  loading,
  progressionMode = "sequential",
  courseQuiz,
}) => {
  const queryClient = useQueryClient();

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [activeDragItem, setActiveDragItem] = useState<DragItem | null>(null);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [localModules, setLocalModules] =
    useState<IModuleWithState[]>(modules);

  useEffect(() => {
    setLocalModules(modules);
  }, [modules]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedModules(new Set(localModules.map((m) => m._id)));
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  const reorderModulesMutation = useMutation({
    mutationFn: (moduleOrders: { id: string; order: number }[]) =>
      moduleApi.reorderModules({ courseId, modules: moduleOrders }),
    onSuccess: () => {
      toast.success("Module order saved");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      setHasOrderChanges(false);
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to save order", {
        description: error.response?.data?.message,
      });
      setLocalModules(modules);
    },
  });

  const reorderLessonsMutation = useMutation({
    mutationFn: ({
      moduleId,
      lessons,
    }: {
      moduleId: string;
      lessons: { id: string; order: number }[];
    }) => lessonApi.reorderLessons({ moduleId, lessons }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to reorder lessons", {
        description: error.response?.data?.message,
      });
      setLocalModules(modules);
    },
  });

  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => moduleApi.deleteModule(moduleId),
    onSuccess: () => {
      toast.success("Module deleted");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete module", {
        description: error.response?.data?.message,
      });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => quizApi.deleteQuiz(quizId),
    onSuccess: () => {
      toast.success("Quiz deleted");
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete quiz", {
        description: error.response?.data?.message,
      });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id.toString();

    const activeModule = localModules.find((m) => m._id === activeId);
    if (activeModule) {
      setActiveDragItem({
        type: "module",
        id: activeId,
        data: activeModule,
      });
      return;
    }

    for (const courseModule of localModules) {
      const lesson = courseModule.lessons?.find((l) => l._id === activeId);
      if (lesson) {
        setActiveDragItem({
          type: "lesson",
          id: activeId,
          data: lesson,
        });
        return;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeModule = localModules.find((m) => m._id === activeId);

    if (activeModule) {
      const oldIndex = localModules.findIndex((m) => m._id === activeId);
      const newIndex = localModules.findIndex((m) => m._id === overId);

      if (oldIndex !== newIndex) {
        const newModules = arrayMove(localModules, oldIndex, newIndex);
        setLocalModules(newModules);
        setHasOrderChanges(true);
      }
      return;
    }

    const activeModuleIndex = localModules.findIndex((m) =>
      m.lessons?.some((l) => l._id === activeId),
    );

    const overModuleIndex = localModules.findIndex((m) =>
      m.lessons?.some((l) => l._id === overId),
    );

    if (activeModuleIndex !== -1 && activeModuleIndex === overModuleIndex) {
      const courseModule = localModules[activeModuleIndex];
      const lessons = courseModule.lessons ?? [];

      const oldIndex = lessons.findIndex((l) => l._id === activeId);
      const newIndex = lessons.findIndex((l) => l._id === overId);

      if (oldIndex !== newIndex) {
        const newLessons = arrayMove(lessons, oldIndex, newIndex);
        const newModules = [...localModules];
        newModules[activeModuleIndex] = {
          ...courseModule,
          lessons: newLessons,
        };

        setLocalModules(newModules);

        reorderLessonsMutation.mutate({
          moduleId: courseModule._id,
          lessons: newLessons.map((lesson, idx) => ({
            id: lesson._id,
            order: idx + 1,
          })),
        });
      }
    }
  };

  const saveModuleOrder = () => {
    reorderModulesMutation.mutate(
      localModules.map((module, idx) => ({
        id: module._id,
        order: idx + 1,
      })),
    );
  };

  const cancelModuleOrder = () => {
    setLocalModules(modules);
    setHasOrderChanges(false);
  };

  const stats = useMemo(() => {
    const totalLessons = localModules.reduce(
      (acc, module) => acc + (module.lessons?.length || 0),
      0,
    );

    const totalQuizzes = localModules.reduce((acc, module) => {
      const lessonQuizzes =
        module.lessons?.filter((lesson) => lesson.quiz)
          .length || 0;
      const moduleQuiz = module.quiz ? 1 : 0;
      return acc + lessonQuizzes + moduleQuiz;
    }, 0);

    return {
      totalLessons,
      totalQuizzes: totalQuizzes + (courseQuiz ? 1 : 0),
      publishedModules: localModules.filter((m) => m.isPublished).length,
    };
  }, [localModules, courseQuiz]);

  if (loading) return <CourseBuilderSkeleton />;

  return (
    <div className="space-y-6">
      {courseQuiz && (
        <CourseQuizBanner
          quiz={courseQuiz}
          courseId={courseId}
          onDelete={() => deleteQuizMutation.mutate(courseQuiz._id)}
        />
      )}

      <CourseBuilderHeader
        localModulesLength={localModules.length}
        totalLessons={stats.totalLessons}
        totalQuizzes={stats.totalQuizzes}
        progressionMode={progressionMode}
        hasOrderChanges={hasOrderChanges}
        reorderPending={reorderModulesMutation.isPending}
        courseId={courseId}
        courseQuizExists={!!courseQuiz}
        onCancelOrder={cancelModuleOrder}
        onSaveOrder={saveModuleOrder}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
      />

      {localModules.length === 0 ? (
        <EmptyState courseId={courseId} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localModules.map((m) => m._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {localModules.map((courseModule, moduleIndex) => (
                <SortableModuleItem
                  key={courseModule._id}
                  module={courseModule}
                  moduleIndex={moduleIndex}
                  courseId={courseId}
                  isExpanded={expandedModules.has(courseModule._id)}
                  onToggle={() => toggleModule(courseModule._id)}
                  onDelete={() => deleteModuleMutation.mutate(courseModule._id)}
                  deleteLoading={deleteModuleMutation.isPending}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: {
                  active: { opacity: "0.5" },
                },
              }),
            }}
          >
            {activeDragItem ? (
              activeDragItem.type === "module" ? (
                <ModuleDragOverlay
                  module={activeDragItem.data as IModuleWithState}
                />
              ) : (
                <LessonDragOverlay lesson={activeDragItem.data as ILessonWithState} />
              )
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
