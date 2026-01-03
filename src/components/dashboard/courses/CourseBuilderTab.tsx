"use client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ILesson } from "@/interfaces/lesson.interface";
import { IModule } from "@/interfaces/module.interface";
import { useEffect, useState } from "react";
import ModuleCard from "./modules/ModuleCard";
import ModuleForm from "./modules/ModuleForm";

interface CourseBuilderTabProps {
  modules: IModule[];
  lessons: ILesson[];
  courseId: string;
  loading: boolean;
}

export const CourseBuilderTab: React.FC<CourseBuilderTabProps> = ({
  modules,
  lessons,
  courseId,
  loading,
}) => {
  const [items, setItems] = useState<IModule[]>([]);
  // const reorderMutation = useReorderModules(courseId);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([...modules].sort((a, b) => a.order - b.order));
  }, [modules]);

  const isBusy = loading;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <ModuleForm courseId={courseId}>
          <Button>Add Module</Button>
        </ModuleForm>
      </div>

      {isBusy ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((module) => (
            <ModuleCard
              key={module._id}
              module={module}
              courseId={courseId}
              lessons={lessons.filter((l) => l.module === module._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
