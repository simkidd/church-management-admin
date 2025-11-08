"use client";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import { IUser, ListUsersParams } from "@/interfaces/user.interface";
import usersApi from "@/lib/api/user.api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const useUsers = (params?: ListUsersParams) => {
  const { data, isPending, isError, refetch } = useQuery<
    ApiResponse<PaginatedResponse<IUser>>
  >({
    queryKey: ["allUsers", params],
    queryFn: async () => usersApi.getUsers(params),
  });

  const { users, totalUsers, totalPages } = useMemo(() => {
    if (!data || isPending || isError)
      return { users: [], totalUsers: 0, totalPages: 0 };

    return {
      users: data.data.data || [],
      totalUsers: data.data.pagination.totalItems || 0,
      totalPages: data.data.pagination.totalPages || 0,
    };
  }, [data, isPending, isError]);

  return {
    users,
    totalUsers,
    totalPages,
    isPending,
    isError,
    refetch,
  };
};

export default useUsers;
