import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ILesson } from "@/interfaces/course.interface";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import LessonItem from "./LessonItem";

interface LessonsTabProps {
  lessons: ILesson[];
  courseId: string;
}

export const LessonsTab = ({ lessons, courseId }: LessonsTabProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Course Lessons</CardTitle>
        <Button asChild size={'sm'}>
          <Link href={`/dashboard/courses/${courseId}/lessons/new`}>
            <Plus className="h-4 w-4" />
            Add Lesson
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lessons.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No lesson yet"
              description="Get started by adding your first lesson"
            />
          ) : (
            lessons.map((lesson) => (
              <LessonItem
                key={lesson._id}
                lesson={lesson}
                courseId={courseId}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
