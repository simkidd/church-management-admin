"use client";
import { IExam, ListExamsParams } from "@/interfaces/exam.interface";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import examsApi from "@/lib/api/exam.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useExams = (params?: ListExamsParams) => {
  const { data, isPending, isError, refetch } = useQuery<
    ApiResponse<PaginatedResponse<IExam>>
  >({
    queryKey: ["allExams", params],
    queryFn: async () => examsApi.getExams(params),
  });

  const { exams, totalExams, totalPages } = useMemo(() => {
    if (!data || isPending || isError)
      return { exams: [], totalExams: 0, totalPages: 0 };

    return {
      exams: data.data.data || [],
      totalExams: data.data.pagination.totalItems || 0,
      totalPages: data.data.pagination.totalPages || 0,
    };
  }, [data, isPending, isError]);

  return {
    exams,
    totalExams,
    totalPages,
    isPending,
    isError,
    refetch,
  };
};

export default useExams;
