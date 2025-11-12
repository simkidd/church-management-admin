"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Users,
  Clock,
  BookOpen,
  Plus,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { ListCourseParams, ICourse } from "@/interfaces/course.interface";
import { courseApi } from "@/lib/api/course.api";
import useCourses from "@/hooks/use-courses";
import CourseCard from "./CourseCard";
import { debounce } from "@/utils/helpers/debounce";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCardSkeleton } from "./CourseCardSkeleton";

export function CourseGrid() {
  const [filters, setFilters] = useState<ListCourseParams>({
    page: 1,
    limit: 10,
  });

  const { courses, isPending, totalCourses, totalPages } = useCourses(filters);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilters((prev) => ({
          ...prev,
          search: searchValue.trim() || undefined,
          page: 1,
        }));
      }, 500), // 500ms delay
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setFilters({ page: 1, limit: 10 });
    debouncedSearch.cancel();
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setFilters((prev) => ({
      ...prev,
      isPublished: status === "all" ? undefined : status === "published",
      page: 1,
    }));
  };

  const onPaginationChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const hasActiveFilters = filters.search || filters.isPublished !== undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "published" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("published")}
                >
                  Published
                </Button>
                <Button
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleStatusFilterChange("draft")}
                >
                  Draft
                </Button>
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="pb-6">
          <div className="leading-none font-semibold">
            {isPending ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `Courses (${totalCourses})`
            )}
          </div>
        </div>
        <div>
          {isPending ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : !courses || courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses found"
              description="Try adjusting your filters or search terms."
              action={
                hasActiveFilters && (
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
