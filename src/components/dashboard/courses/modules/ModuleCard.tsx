"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Loader2, MoreVertical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import ModuleForm from "./ModuleForm";
import LessonForm from "../lessons/LessonForm";
import LessonCard from "../lessons/LessonCard";
import QuizForm from "./QuizForm";

import { ILesson } from "@/interfaces/lesson.interface";
import { IModule } from "@/interfaces/module.interface";
import { moduleApi } from "@/lib/api/module.api";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { quizApi } from "@/lib/api/quiz.api";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ModuleCardProps {
  module: IModule;
  lessons: ILesson[];
  courseId: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  lessons,
  courseId,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const lastOrder =
    lessons.length > 0 ? Math.max(...lessons.map((l) => l.order)) : 0;

  // fetch quiz for the module
  const { data, isPending } = useQuery({
    queryKey: ["quiz", module._id],
    queryFn: () => quizApi.getQuizByModule(module._id),
  });

  const quiz = data?.data;

  // Delete module mutation
  const deleteMutation = useMutation({
    mutationFn: () => moduleApi.deleteModule(module._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-modules", courseId] });
      setIsDeleteDialogOpen(false);
      toast.success("Module deleted successfully");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Failed to delete module", {
        description: error.response?.data.message,
      });
    },
  });

  const handleDeleteModule = () => {
    deleteMutation.mutate();
  };

  return (
    <Card className="py-0">
      <Accordion type="single" collapsible>
        <AccordionItem value={module._id} className="border-none">
          {/* Header */}
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-left">
                <span className="font-medium">{module.order}.</span>
                <span className="font-semibold">{module.title}</span>
                <Badge variant="secondary">{lessons.length} lessons</Badge>
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    {/* Edit module */}
                    <ModuleForm
                      courseId={courseId}
                      initialValues={module}
                      isEdit
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                      </DropdownMenuItem>
                    </ModuleForm>

                    <DropdownMenuSeparator />

                    {/* Delete module */}
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => {
                        e.preventDefault();
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete Module
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </AccordionTrigger>

          {/* Content */}
          <AccordionContent>
            <CardContent className="space-y-4 pt-2">
              {/* Add Lesson */}
              <LessonForm
                moduleId={module._id}
                lastOrder={lastOrder}
                courseId={courseId}
              >
                <Button size="sm" variant="outline">
                  Add Lesson
                </Button>
              </LessonForm>

              {/* Lesson List */}
              {lessons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lessons yet.</p>
              ) : (
                <div className="space-y-2">
                  {lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson) => (
                      <LessonCard
                        key={lesson._id}
                        lesson={lesson}
                        moduleId={module._id}
                        courseId={courseId}
                      />
                    ))}
                </div>
              )}

              {/* Quiz Section */}
              <div className="mt-2">
                {quiz ? (
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/dashboard/courses/quiz/${quiz._id}`}>
                      Edit Quiz
                    </Link>
                  </Button>
                ) : (
                  <QuizForm moduleId={module._id}>
                    <Button size="sm" variant="secondary">
                      Add Quiz
                    </Button>
                  </QuizForm>
                )}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Delete Module Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this module? This will remove all
              lessons and quizzes under it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                handleDeleteModule();
              }}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ModuleCard;
