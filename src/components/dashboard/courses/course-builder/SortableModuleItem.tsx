import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  GripVertical,
  HelpCircle,
  MoreVertical,
  PlayCircle,
  Plus,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { IModuleWithLessons, IModuleWithState } from "@/interfaces/module.interface";
import { ILessonWithQuiz } from "@/interfaces/lesson.interface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModuleForm from "../modules/ModuleForm";
import LessonForm from "../lessons/LessonForm";
import QuizForm from "../quiz/QuizQuestionForm";
import { SortableLessonItem } from "./SortableLessonItem";
import { ModuleQuizCard } from "./ModuleQuizCard";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortableModuleItemProps {
  module: IModuleWithState;
  moduleIndex: number;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  deleteLoading: boolean;
}

export const SortableModuleItem = ({
  module,
  moduleIndex,
  courseId,
  isExpanded,
  onToggle,
  onDelete,
  deleteLoading,
}: SortableModuleItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group rounded-lg border bg-card shadow-sm overflow-hidden",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
          !module.isPublished && "border-dashed"
        )}
      >
        <div className="flex items-center gap-3 p-4 bg-card">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          <button
            onClick={onToggle}
            className="p-1.5 rounded hover:bg-muted transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                M{moduleIndex + 1}
              </span>
              <h3 className="font-semibold truncate">{module.title}</h3>
              {!module.isPublished && (
                <Badge variant="secondary" className="text-xs">
                  Draft
                </Badge>
              )}
            </div>

            {module.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {module.description}
              </p>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              {module.lessons?.length || 0}
            </span>
            {module.quiz && (
              <span className="flex items-center gap-1">
                <HelpCircle className="h-4 w-4 text-amber-500" />
                Quiz
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <LessonForm moduleId={module._id} courseId={courseId}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </LessonForm>

            {!module.quiz && (
              <QuizForm
                courseId={courseId}
                moduleId={module._id}
                scopeType="module"
                trigger={
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                  </Button>
                }
              />
            )}

            <ModuleForm courseId={courseId} initialValues={module} isEdit>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit2 className="h-4 w-4" />
              </Button>
            </ModuleForm>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onToggle}>
                  {isExpanded ? "Collapse" : "Expand"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Module
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-muted/30"
            >
              <div className="p-4 space-y-3">
                {module.lessons && module.lessons.length > 0 ? (
                  <SortableContext
                    items={module.lessons.map((l) => l._id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {module.lessons.map((lesson, lessonIndex) => (
                      <SortableLessonItem
                        key={lesson._id}
                        lesson={lesson}
                        lessonIndex={lessonIndex}
                        moduleId={module._id}
                        courseId={courseId}
                      />
                    ))}
                  </SortableContext>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No lessons yet</p>
                    <LessonForm moduleId={module._id} courseId={courseId}>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4" />
                        Add First Lesson
                      </Button>
                    </LessonForm>
                  </div>
                )}

                {module.quiz && (
                  <ModuleQuizCard
                    quiz={module.quiz}
                    courseId={courseId}
                    moduleId={module._id}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{module.title}</strong> and all its{" "}
              {module.lessons?.length || 0} lessons
              {module.quiz ? " and quiz" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteDialog(false);
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};