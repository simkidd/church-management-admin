"use client";
import { IEvent, ListEventsParams } from "@/interfaces/event.interface";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import { eventsApi } from "@/lib/api/event.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useEvents = (params?: ListEventsParams) => {
  const { data, isPending, isError, refetch } = useQuery<
    ApiResponse<PaginatedResponse<IEvent>>
  >({
    queryKey: ["allEvents", params],
    queryFn: async () => eventsApi.getAllEvents(params),
  });

  const { events, totalEvents, totalPages } = useMemo(() => {
    if (!data || isPending || isError)
      return { event: [], totalEvents: 0, totalPages: 0 };

    return {
      events: data.data.data || [],
      totalEvents: data.data.pagination.totalItems || 0,
      totalPages: data.data.pagination.totalPages || 0,
    };
  }, [data, isPending, isError]);

  return {
    events,
    totalEvents,
    totalPages,
    isPending,
    isError,
    refetch,
  };
};

export default useEvents;
