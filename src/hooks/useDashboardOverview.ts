import { dashboardApi } from "@/lib/api/dashboard.api";
import { useQuery } from "@tanstack/react-query";

export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: dashboardApi.getOverview,
  });
};
