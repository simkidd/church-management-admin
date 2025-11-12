"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, Clock, BookOpen, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { ListCourseParams, ICourse } from "@/interfaces/course.interface";
import { courseApi } from "@/lib/api/course.api";

export function CourseGrid() {
  const [filters, setFilters] = useState<ListCourseParams>({
    page: 1,
    limit: 10,
  });

  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Demo courses for fallback
  const demoCourses = [
    {
      id: "demo-1",
      _id: "demo-1",
      title: "Leadership in the Church",
      description:
        "Learn how to build strong spiritual leadership and manage teams effectively in ministry.",
      lessons: 8,
      duration: "2h 30m",
      students: 45,
      category: "Leadership",
      status: "active",
    },
    {
      id: "demo-2",
      _id: "demo-2",
      title: "Church Financial Management",
      description:
        "Understand budgeting, stewardship, and financial accountability within the church.",
      lessons: 12,
      duration: "3h 15m",
      students: 38,
      category: "Finance",
      status: "active",
    },
    {
      id: "demo-3",
      _id: "demo-3",
      title: "Effective Church Communication",
      description:
        "Develop communication strategies for engaging your congregation and community outreach.",
      lessons: 10,
      duration: "2h 50m",
      students: 52,
      category: "Administration",
      status: "inactive",
    },
    {
      id: "demo-4",
      _id: "demo-4",
      title: "Church Growth Strategies",
      description:
        "Explore biblical and practical methods for sustaining spiritual and numerical growth.",
      lessons: 9,
      duration: "3h 00m",
      students: 60,
      category: "Development",
      status: "active",
    },
  ];

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await courseApi.getAllCourses(filters);
        
        console.log("=== COURSES API RESPONSE ===");
        console.log("Response:", response);
        
        if (response.success && response.data?.courses) {
          // Combine API courses with demo courses
          const apiCourses = response.data.courses;
          setCourses([...apiCourses, ...demoCourses]);
        } else if (response.data) {
          // Handle alternate response format
          const apiCourses = Array.isArray(response.data) ? response.data : [];
          setCourses([...apiCourses, ...demoCourses]);
        } else {
          // If no API courses, show demo courses only
          setCourses(demoCourses);
        }
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        // On error, still show demo courses
        setCourses(demoCourses);
        setError(null); // Don't show error if we have demo courses
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) =>
      course.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, courses]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error state - only show if we have no courses at all
  if (error && courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Courses</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search church courses..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card
            key={course._id || course.id}
            className="hover:shadow-lg transition-shadow border border-muted/20 rounded-2xl"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold leading-tight">
                  {course.title}
                </CardTitle>
                <Badge
                  variant={course.status === "active" ? "default" : "secondary"}
                >
                  {course.status || "active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {course.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.lessons || 0} lessons</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration || "N/A"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{course.students || 0} students</span>
                </div>
                <span className="text-xs px-2 py-1 bg-secondary rounded-full capitalize">
                  {course.category || "General"}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Link
                  href={`/dashboard/courses/${course._id || course.id}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    View
                  </Button>
                </Link>
                <Link href={`/dashboard/courses/${course._id || course.id}`}>
                  <Button size="sm">Manage</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? "Try adjusting your search terms"
              : "Get started by creating your first church management course"}
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