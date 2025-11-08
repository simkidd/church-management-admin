"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Clock, BookOpen, Plus } from "lucide-react";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  students: number;
  duration: string;
  lessons: number;
  category: string;
  status: "active" | "draft";
  thumbnail?: string;
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Bible Study 101",
    description: "Introduction to biblical studies and interpretation",
    instructor: "Pastor John",
    students: 45,
    duration: "8 weeks",
    lessons: 12,
    category: "Theology",
    status: "active",
  },
  {
    id: "2",
    title: "New Members Class",
    description: "Welcome course for new church members",
    instructor: "Sarah Johnson",
    students: 23,
    duration: "4 weeks",
    lessons: 6,
    category: "Membership",
    status: "active",
  },
  {
    id: "3",
    title: "Christian Leadership",
    description: "Developing leadership skills in ministry",
    instructor: "Mike Chen",
    students: 18,
    duration: "10 weeks",
    lessons: 15,
    category: "Leadership",
    status: "draft",
  },
];

export function CourseGrid() {
  const [search, setSearch] = useState("");

  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(search.toLowerCase()) ||
    course.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search courses..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">
                  {course.title}
                </CardTitle>
                <Badge variant={course.status === "active" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{course.students} students</span>
                </div>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                  {course.category}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View
                  </Button>
                </Link>
                <Link href={`/dashboard/courses/${course.id}/lessons`}>
                  <Button size="sm">
                    Manage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try adjusting your search terms" : "Get started by creating your first course"}
          </p>
          <Link href="/dashboard/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}