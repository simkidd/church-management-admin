"use client";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useCourses from "@/hooks/use-courses";
import { ListCourseParams } from "@/interfaces/course.interface";
import { debounce } from "@/utils/helpers/debounce";
import { BookOpen, RefreshCw, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CourseCard from "./CourseCard";
import { CourseCardSkeleton } from "./CourseCardSkeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getPaginationRange } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

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
        <div>
          {isPending ? (
            <>
              <div className="pb-6">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            </>
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
            <>
              <div className="pb-6">
                <div className="leading-none font-semibold">
                  Courses ({totalCourses})
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>

              {courses.length > 0 && totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => onPaginationChange(filters.page! - 1)}
                        aria-disabled={filters.page === 1}
                        className={cn(
                          "cursor-pointer",
                          filters.page === 1 && "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>

                    {getPaginationRange(filters.page!, totalPages).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === filters.page}
                            onClick={() => onPaginationChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => onPaginationChange(filters.page! + 1)}
                        aria-disabled={filters.page! >= totalPages}
                        className={cn(
                          "cursor-pointer",
                          filters.page! >= totalPages &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
