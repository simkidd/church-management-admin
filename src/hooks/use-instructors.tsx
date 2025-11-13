"use client";
import usersApi from "@/lib/api/user.api";
import { useQuery } from "@tanstack/react-query";

const useInstructors = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["instructors", "list"],
    queryFn: async () => usersApi.getInstructorsList(),
  });

  return {
    instructors: data?.data,
    isPending,
    isError,
  };
};

export default useInstructors;
