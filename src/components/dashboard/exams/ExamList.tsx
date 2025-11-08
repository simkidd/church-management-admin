"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface Exam {
  id: string;
  title: string;
  course: string;
  duration: number; // minutes
  totalQuestions: number;
  passingScore: number;
  submissions: number;
  status: "active" | "draft" | "completed";
  dueDate?: string;
}

const mockExams: Exam[] = [
  {
    id: "1",
    title: "Bible Study 101 - Final Exam",
    course: "Bible Study 101",
    duration: 60,
    totalQuestions: 25,
    passingScore: 70,
    submissions: 23,
    status: "active",
    dueDate: "2024-02-15",
  },
  {
    id: "2",
    title: "New Members Assessment",
    course: "New Members Class",
    duration: 30,
    totalQuestions: 15,
    passingScore: 80,
    submissions: 18,
    status: "active",
  },
  {
    id: "3",
    title: "Leadership Principles Quiz",
    course: "Christian Leadership",
    duration: 45,
    totalQuestions: 20,
    passingScore: 75,
    submissions: 0,
    status: "draft",
  },
];

export function ExamList() {
  const [search, setSearch] = useState("");

  const filteredExams = mockExams.filter(exam =>
    exam.title.toLowerCase().includes(search.toLowerCase()) ||
    exam.course.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search exams..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Submissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {exam.title}
                  </div>
                </TableCell>
                <TableCell>{exam.course}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {exam.duration} min
                  </div>
                </TableCell>
                <TableCell>{exam.totalQuestions}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {exam.submissions}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(exam.status)}>
                    {exam.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/exams/${exam.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    <Link href={`/dashboard/exams/submissions/${exam.id}`}>
                      <Button size="sm">
                        Grade
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No exams found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search terms" : "Create your first exam to get started"}
          </p>
          <Link href="/dashboard/exams/create">
            <Button>
              Create Exam
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}