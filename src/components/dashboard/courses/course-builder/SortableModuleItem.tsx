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
        {/* Header - stacked on mobile, horizontal on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-card">
          {/* Top row: Drag, Toggle, Title, Actions */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  {...attributes}
                  {...listeners}
                  className="p-1.5 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none shrink-0"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
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
                  className="p-1.5 rounded hover:bg-muted transition-colors cursor-pointer shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isExpanded ? "Collapse module" : "Expand module"}</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded shrink-0">
                  M{moduleIndex + 1}
                </span>
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {module.title}
                </h3>
                {!module.isPublished && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs">
                    Draft
                  </Badge>
                )}
              </div>

              {/* Description - hidden on very small screens */}
              {module.description && (
                <p className="hidden sm:block text-sm text-muted-foreground truncate mt-0.5">
                  {module.description}
                </p>
              )}
            </div>

            {/* Stats - inline on mobile, separate on desktop */}
            <div className="flex sm:hidden items-center gap-3 text-xs text-muted-foreground shrink-0">
              <span className="flex items-center gap-1">
                <PlayCircle className="h-3.5 w-3.5" />
                {module.lessons?.length || 0}
              </span>
              {module.quiz && (
                <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
              )}
            </div>

            {/* Actions - always visible but compact */}
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              {/* Mobile: More menu contains most actions */}
              <div className="flex sm:hidden items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger>
                    <LessonForm moduleId={module._id} courseId={courseId}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </LessonForm>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Add lesson</p>
                  </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                            <HelpCircle className="h-4 w-4 mr-2 text-amber-500" />
                            Add Quiz
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
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Module
                      </DropdownMenuItem>
                    </ModuleForm>
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

              {/* Desktop: All buttons visible */}
              <div className="hidden sm:flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger>
                    <LessonForm moduleId={module._id} courseId={courseId}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </LessonForm>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Add lesson</p>
                  </TooltipContent>
                </Tooltip>

                {!module.quiz && (
                  <Tooltip>
                    <TooltipTrigger>
                      <QuizForm
                        courseId={courseId}
                        moduleId={module._id}
                        scopeType="module"
                        trigger={
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <HelpCircle className="h-4 w-4 text-amber-500" />
                          </Button>
                        }
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Add quiz</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                <Tooltip>
                  <TooltipTrigger>
                    <ModuleForm
                      courseId={courseId}
                      initialValues={module}
                      isEdit
                    >
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </ModuleForm>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Edit module</p>
                  </TooltipContent>
                </Tooltip>

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
          </div>

          {/* Desktop stats row */}
          <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1">
                  <PlayCircle className="h-4 w-4" />
                  {module.lessons?.length || 0}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{module.lessons?.length || 0} lessons</p>
              </TooltipContent>
            </Tooltip>

            {module.quiz && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4 text-amber-500" />
                    Quiz
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Module has a quiz</p>
                </TooltipContent>
              </Tooltip>
            )}
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
