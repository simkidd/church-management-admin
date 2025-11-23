"use client";
import usersApi from "@/lib/api/user.api";
import { useQuery } from "@tanstack/react-query";

const usePastors = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["pastors", "list"],
    queryFn: async () => usersApi.getPastorsList(),
  });

  return {
    pastors: data?.data,
    isPending,
    isError,
  };
};

export default usePastors;
