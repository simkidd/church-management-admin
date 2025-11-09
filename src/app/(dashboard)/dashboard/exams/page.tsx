import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExamList } from "@/components/dashboard/exams/ExamList";
import { FileCheck, Plus } from "lucide-react";
import Link from "next/link";

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Exam Management
            </h1>
            <p className="text-muted-foreground">Create and manage exams</p>
          </div>
        </div>

        <Link href="/dashboard/exams/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create Exam
          </Button>
        </Link>
      </div>

      <ExamList />
    </div>
  );
}
