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
import {
  IModuleWithLessons,
  IModuleWithState,
} from "@/interfaces/module.interface";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          "rounded-lg border bg-card shadow-sm overflow-hidden",
          isDragging && "opacity-50 shadow-lg ring-2 ring-primary",
          !module.isPublished && "border-dashed",
        )}
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      {...attributes}
                      {...listeners}
                      className="rounded-md p-2 hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Drag to reorder</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onToggle}
                      className="rounded-md p-2 hover:bg-muted transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{isExpanded ? "Collapse module" : "Expand module"}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[11px]">
                    M{moduleIndex + 1}
                  </Badge>

                  <h3 className="min-w-0 break-words text-sm font-semibold sm:text-base">
                    {module.title}
                  </h3>

                  {!module.isPublished && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs"
                    >
                      Draft
                    </Badge>
                  )}
                </div>

                {module.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {module.description}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    <PlayCircle className="h-3.5 w-3.5" />
                    <span>{module.lessons?.length || 0} lessons</span>
                  </div>

                  {module.quiz && (
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Module quiz</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <div className="hidden items-center justify-end gap-1 whitespace-nowrap sm:flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <LessonForm moduleId={module._id} courseId={courseId}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </LessonForm>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Add lesson</p>
                  </TooltipContent>
                </Tooltip>

                {!module.quiz && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <QuizForm
                          courseId={courseId}
                          moduleId={module._id}
                          scopeType="module"
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0"
                            >
                              <HelpCircle className="h-4 w-4 text-amber-500" />
                            </Button>
                          }
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Add module quiz</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ModuleForm
                        courseId={courseId}
                        initialValues={module}
                        isEdit
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-9 w-9 p-0"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </ModuleForm>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Edit module</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
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
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Module
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-end gap-1 whitespace-nowrap sm:hidden">
                <LessonForm moduleId={module._id} courseId={courseId}>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </LessonForm>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {!module.quiz && (
                      <QuizForm
                        courseId={courseId}
                        moduleId={module._id}
                        scopeType="module"
                        trigger={
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            <HelpCircle className="mr-2 h-4 w-4 text-amber-500" />
                            Add Module Quiz
                          </DropdownMenuItem>
                        }
                      />
                    )}

                    <ModuleForm
                      courseId={courseId}
                      initialValues={module}
                      isEdit
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit Module
                      </DropdownMenuItem>
                    </ModuleForm>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Module
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
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
              <div className="p-3 sm:p-4 space-y-3">
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
        <AlertDialogContent className="max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete <strong>{module.title}</strong> and all its{" "}
              {module.lessons?.length || 0} lessons
              {module.quiz ? " and quiz" : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={deleteLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDelete();
                setShowDeleteDialog(false);
              }}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground w-full sm:w-auto"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
