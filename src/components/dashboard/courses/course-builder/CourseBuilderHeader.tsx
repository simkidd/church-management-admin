import {
  BookOpen,
  HelpCircle,
  LayoutList,
  Plus,
  Save,
  Trophy,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModuleForm from "../modules/ModuleForm";
import QuizForm from "../quiz/QuizQuestionForm";

interface CourseBuilderHeaderProps {
  localModulesLength: number;
  totalLessons: number;
  totalQuizzes: number;
  progressionMode: "free" | "sequential";
  hasOrderChanges: boolean;
  reorderPending: boolean;
  courseId: string;
  courseQuizExists: boolean;
  onCancelOrder: () => void;
  onSaveOrder: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const CourseBuilderHeader = ({
  localModulesLength,
  totalLessons,
  totalQuizzes,
  progressionMode,
  hasOrderChanges,
  reorderPending,
  courseId,
  courseQuizExists,
  onCancelOrder,
  onSaveOrder,
  onExpandAll,
  onCollapseAll,
}: CourseBuilderHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg border">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LayoutList className="h-4 w-4" />
          <span className="font-medium text-foreground">
            {localModulesLength}
          </span>
          modules
          <span className="text-border">|</span>
          <BookOpen className="h-4 w-4" />
          <span className="font-medium text-foreground">{totalLessons}</span>
          lessons
          <span className="text-border">|</span>
          <HelpCircle className="h-4 w-4" />
          <span className="font-medium text-foreground">{totalQuizzes}</span>
          quizzes
        </div>

        {progressionMode === "sequential" && (
          <Badge variant="secondary" className="text-xs">
            Sequential
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        {hasOrderChanges ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancelOrder}
              disabled={reorderPending}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={onSaveOrder} disabled={reorderPending}>
              <Save className="h-4 w-4 mr-1" />
              Save Order
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onExpandAll}
              disabled={localModulesLength === 0}
            >
              Expand All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCollapseAll}
              disabled={localModulesLength === 0}
            >
              Collapse All
            </Button>
          </>
        )}

        {!courseQuizExists && (
          <QuizForm
            courseId={courseId}
            scopeType="course"
            trigger={
              <Button variant="outline" size="sm">
                <Trophy className="h-4 w-4" />
                Final Exam
              </Button>
            }
          />
        )}

        <ModuleForm courseId={courseId}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
        </ModuleForm>
      </div>
    </div>
  );
};
