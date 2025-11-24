"use client";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import { ISermon, ListSermonsParams } from "@/interfaces/sermon.interface";
import { sermonsApi } from "@/lib/api/sermon.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useSermons = (params?: ListSermonsParams) => {
  const { data, isPending, isError, refetch } = useQuery<
    ApiResponse<PaginatedResponse<ISermon>>
  >({
    queryKey: ["allSermons", params],
    queryFn: async () => sermonsApi.getAllSermons(params),
  });

  const { sermons, totalSermons, totalPages } = useMemo(() => {
    if (!data || isPending || isError)
      return { sermons: [], totalSermons: 0, totalPages: 0 };

    return {
      sermons: data.data.data || [],
      totalSermons: data.data.pagination.totalItems || 0,
      totalPages: data.data.pagination.totalPages || 0,
    };
  }, [data, isPending, isError]);

  return {
    sermons,
    totalSermons,
    totalPages,
    isPending,
    isError,
    refetch,
  };
};

export default useSermons;
