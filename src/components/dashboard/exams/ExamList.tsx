"use client";

import { getPaginationRange } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useExams from "@/hooks/useExams";
import { IExam, ListExamsParams } from "@/interfaces/exam.interface";
import { cn } from "@/lib/utils";
import { debounce } from "@/utils/helpers/debounce";
import { formatDuration } from "@/utils/helpers/time";
import {
  Clock,
  Eye,
  FilePenLine,
  FileText,
  MoreHorizontal,
  RefreshCw,
  Search
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

const ActionComp = ({ exam }: { exam: IExam }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/dashboard/exams/${exam._id}`}>
            <Eye className="h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/dashboard/exams/submissions/${exam._id}`}>
            <FilePenLine className="h-4 w-4" />
            Grade
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function ExamList() {
  const [filters, setFilters] = useState<ListExamsParams>({
    page: 1,
    limit: 5,
  });
  const { exams, isPending, totalExams, totalPages } = useExams(filters);
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

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setFilters({ page: 1, limit: 10 });
    debouncedSearch.cancel();
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (isPublished: boolean) => {
    return isPublished ? "Published" : "Draft";
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
                  placeholder="Search exams..."
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
                Reset Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isPending ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              `All Exams (${totalExams})`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <Table>
              <TableBody>
                {[...Array(5)].map((_, rowIndex) => (
                  <TableRow key={`skeleton-${rowIndex}`}>
                    {[...Array(6)].map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !exams || exams.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No exams found"
              description={
                hasActiveFilters
                  ? "Try adjusting your filters or search terms."
                  : "No exams have been created yet."
              }
              action={
                hasActiveFilters && (
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset Filters
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <Link href={`/dashboard/exams/${exam._id}`}>
                          {exam.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{exam.course.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDuration(exam.duration)}
                      </div>
                    </TableCell>
                    <TableCell>{exam.questionCount || 0}</TableCell>

                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(exam.isPublished)}
                      >
                        {getStatusText(exam.isPublished)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ActionComp exam={exam} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {exams && exams.length > 0 && (
          <CardFooter className="flex justify-between">
            {/* Pagination controls */}
            {exams.length > 0 && totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPaginationChange(filters.page - 1)}
                      aria-disabled={filters.page === 1}
                      className={cn(
                        "cursor-pointer",
                        filters.page === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>

                  {getPaginationRange(filters.page, totalPages).map((page) => (
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
                      onClick={() => onPaginationChange(filters.page + 1)}
                      aria-disabled={filters.page >= totalPages}
                      className={cn(
                        "cursor-pointer",
                        filters.page >= totalPages &&
                          "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
