"use client";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import examApi from "@/lib/api/exam.api";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import CourseExamCard from "./CourseExamCard";
import { useState } from "react";
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
import { ApiResponse } from "@/interfaces/response.interface";
import { ExamsByCourseResponse, IExam } from "@/interfaces/exam.interface";

interface ExamsTabProps {
  courseId: string;
}

interface ListExamsParams {
  page: number;
  limit?: number;
  isPublished?: boolean;
}

const ExamsTab = ({ courseId }: ExamsTabProps) => {
  const [filters, setFilters] = useState<ListExamsParams>({
    page: 1,
    limit: 3,
  });

  const { data: examsData, isPending: examsLoading } = useQuery<
    ApiResponse<ExamsByCourseResponse>
  >({
    queryKey: ["exams", courseId, filters],
    queryFn: () => examApi.getExamsByCourse(courseId, filters),
    enabled: !!courseId,
  });

  const exams = examsData?.data?.data || [];
  const pagination = examsData?.data?.pagination;
  const totalPages = pagination?.totalPages || 0;
  const totalItems = pagination?.totalItems || 0;

  const onPaginationChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  if (examsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Course Exams</CardTitle>
        <Button asChild size={"sm"}>
          <Link href={`/dashboard/exams/create?courseId=${courseId}`}>
            <Plus className="h-4 w-4" />
            Create Exam
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {exams.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No exams yet"
              description="Create your first exam to assess student learning"
            />
          ) : (
            exams.map((exam) => (
              <CourseExamCard key={exam._id} exam={exam} />
            ))
          )}
        </div>
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
  );
};

export default ExamsTab;
