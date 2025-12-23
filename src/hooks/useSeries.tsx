"use client";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import { ISeries, ListSeriesParams } from "@/interfaces/series.interface";
import { seriesApi } from "@/lib/api/series.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useSeries = (params?: ListSeriesParams) => {
  const { data, isPending, isError, refetch } = useQuery<
    ApiResponse<PaginatedResponse<ISeries>>
  >({
    queryKey: ["allSeries", params],
    queryFn: async () => seriesApi.getAllSeries(params),
  });

  const { series, totalSeries, totalPages } = useMemo(() => {
    if (!data || isPending || isError)
      return { series: [], totalSeries: 0, totalPages: 0 };

    return {
      series: data.data.data || [],
      totalSeries: data.data.pagination.totalItems || 0,
      totalPages: data.data.pagination.totalPages || 0,
    };
  }, [data, isPending, isError]);

  return {
    series,
    totalSeries,
    totalPages,
    isPending,
    isError,
    refetch,
  };
};

export default useSeries;
