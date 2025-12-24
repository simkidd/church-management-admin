import { ApiResponse } from "@/interfaces/response.interface";
import { ISeries } from "@/interfaces/series.interface";
import { seriesApi } from "@/lib/api/series.api";
import { useQuery } from "@tanstack/react-query";

export const useSeriesList = () => {
  const { data, isPending } = useQuery<ApiResponse<ISeries[]>>({
    queryKey: ["series-list"],
    queryFn: seriesApi.getSeriesList,
  });

  return {
    series: data?.data,
    isPending,
  };
};
