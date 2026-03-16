import CourseForm from "@/components/dashboard/courses/CourseForm";
import { CourseManagement } from "@/components/dashboard/courses/CourseManagement";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Course Management
          </h1>
          <p className="text-muted-foreground">
            Manage all courses and lessons
          </p>
        </div>

        <CourseForm>
          <Button>
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </CourseForm>
      </div>

      <CourseManagement />
    </div>
  );
}
