// components/courses/CourseTable.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  BookOpen,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useCourses from "@/hooks/use-courses";
import {
  ICourse,
  IMedia,
  ListCourseParams,
} from "@/interfaces/course.interface";
import { IUser } from "@/interfaces/user.interface";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import { getPaginationRange } from "@/components/shared/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { debounce } from "@/utils/helpers/debounce";
import { format } from "date-fns";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import courseApi from "@/lib/api/course.api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

// Action component for each course row
const ActionComp = ({ course }: { course: ICourse }) => {
  const queryClient = useQueryClient();

  const togglePublishMutation = useMutation({
    mutationFn: (isPublished: boolean) => {
      const formData = new FormData();
      formData.append("isPublished", isPublished.toString());
      return courseApi.updateCourse(course?._id as string, formData);
    },
    onSuccess: (data) => {
      const action = data.data.course.isPublished ? "published" : "unpublished";
      toast.success(`Course ${action} successfully`);
      queryClient.invalidateQueries({ queryKey: ["course", course?._id] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error("Update Failed", {
        description:
          error.response?.data?.message || "Failed to update course status.",
      });
    },
  });

  const handleTogglePublish = () =>
    togglePublishMutation.mutate(!course?.isPublished);

  const isPublishing = togglePublishMutation.isPending;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/dashboard/courses/${course._id}`}>
            <Eye className="h-4 w-4" />
            View Course
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleTogglePublish}
          disabled={isPublishing}
        >
          <div className="flex items-center gap-2">
            {course.isPublished ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            {course.isPublished ? "Unpublish" : "Publish"}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Thumbnail component
const Thumbnail = ({
  thumbnail,
  title,
}: {
  thumbnail?: IMedia;
  title: string;
}) => (
  <Avatar className="h-10 w-10 rounded-md">
    <AvatarImage src={thumbnail?.url} alt={title} className="object-cover" />
    <AvatarFallback className="rounded-md bg-primary/10 text-primary text-xs">
      {title?.slice(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
);

// Instructor display component
const InstructorCell = ({ instructor }: { instructor: IUser }) => (
  <div className="flex items-center gap-2">
    <Avatar className="h-6 w-6">
      <AvatarImage src={instructor?.avatar?.url} />
      <AvatarFallback className="text-xs">
        {instructor?.firstName?.[0]}
        {instructor?.lastName?.[0]}
      </AvatarFallback>
    </Avatar>
    <span className="text-sm">
      {instructor?.firstName} {instructor?.lastName}
    </span>
  </div>
);

// Status badge component
const StatusBadge = ({ isPublished }: { isPublished: boolean }) => {
  return (
    <Badge variant={isPublished ? "default" : "secondary"}>
      {isPublished ? (
        <CheckCircle2 className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {isPublished ? "Published" : "Draft"}
    </Badge>
  );
};

// Featured badge
const FeaturedBadge = ({ isFeatured }: { isFeatured: boolean }) => {
  if (!isFeatured) return <span className="text-muted-foreground">-</span>;
  return (
    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
      <Star className="h-3 w-3 mr-1 fill-yellow-500" />
      Featured
    </Badge>
  );
};

export function CourseManagement() {
  const [filters, setFilters] = useState<ListCourseParams>({
    page: 1,
    limit: 10,
  });
  const { courses, isPending, totalCourses, totalPages } = useCourses(filters);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        setFilters((prev) => ({
          ...prev,
          search: searchValue.trim() || undefined,
          page: 1,
        }));
      }, 500),
    [],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  // Status filter handler
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setFilters((prev) => ({
      ...prev,
      isPublished: status === "all" ? undefined : status === "published",
      page: 1,
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("all");
    setFilters({ page: 1, limit: 10 });
    debouncedSearch.cancel();
  };

  // Pagination handler
  const onPaginationChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const hasActiveFilters = filters.search || filters.isPublished !== undefined;

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-8"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
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
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isPending ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `All Courses (${totalCourses})`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            // Loading Skeleton
            <Table>
              <TableBody>
                {[...Array(5)].map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {[...Array(8)].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !courses || courses.length === 0 ? (
            // Empty State
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
            // Data Table
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Thumbnail</TableHead>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Progression</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course._id}>
                    {/* Thumbnail */}
                    <TableCell>
                      <Thumbnail
                        thumbnail={course.thumbnail}
                        title={course.title}
                      />
                    </TableCell>

                    {/* Title & Description */}
                    <TableCell>
                      <div className="flex flex-col max-w-60">
                        <Link href={`/dashboard/courses/${course._id}`}>
                          <span className="font-medium text-sm truncate">
                            {course.title}
                          </span>
                        </Link>
                      </div>
                    </TableCell>

                    {/* Instructor */}
                    <TableCell>
                      <InstructorCell instructor={course.instructor} />
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {course.duration || "N/A"}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge isPublished={course.isPublished} />
                    </TableCell>

                    {/* Featured */}
                    <TableCell>
                      <FeaturedBadge isFeatured={course.isFeatured} />
                    </TableCell>

                    {/* Progression Mode */}
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {course.progressionMode}
                      </Badge>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(course.createdAt), "MMM dd, yyyy")}
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <ActionComp course={course} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Pagination */}
        {courses && courses.length > 0 && totalPages > 1 && (
          <CardFooter className="flex justify-between">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => onPaginationChange(filters.page! - 1)}
                    aria-disabled={filters.page === 1}
                    className={cn(
                      "cursor-pointer",
                      filters.page === 1 && "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>

                {getPaginationRange(filters.page!, totalPages).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === filters.page}
                      onClick={() => onPaginationChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => onPaginationChange(filters.page! + 1)}
                    aria-disabled={filters.page! >= totalPages}
                    className={cn(
                      "cursor-pointer",
                      filters.page! >= totalPages &&
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
