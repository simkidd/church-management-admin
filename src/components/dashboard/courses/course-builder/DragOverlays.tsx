import { ILesson } from "@/interfaces/lesson.interface";
import { IModuleWithState } from "@/interfaces/module.interface";
import { GripVertical, PlayCircle } from "lucide-react";

export const ModuleDragOverlay = ({
  module,
}: {
  module: IModuleWithState;
}) => (
  <div className="rounded-lg border bg-card shadow-lg p-4 opacity-90">
    <div className="flex items-center gap-3">
      <GripVertical className="h-5 w-5 text-muted-foreground" />
      <span className="font-semibold">{module.title}</span>
    </div>
  </div>
);

export const LessonDragOverlay = ({ lesson }: { lesson: ILesson }) => (
  <div className="flex items-center gap-3 p-3 rounded-md bg-card border shadow-lg opacity-90">
    <GripVertical className="h-4 w-4 text-muted-foreground" />
    <PlayCircle className="h-4 w-4" />
    <span className="font-medium text-sm">{lesson.title}</span>
  </div>
);