import { ApiResponse } from "@/interfaces/response.interface";
import { IDashboardOverview } from "@/interfaces/dashboard.interface";
import api from "../axios";

export const dashboardApi = {
  getOverview: async (): Promise<ApiResponse<IDashboardOverview>> => {
    const { data } = await api.get("/dashboard/overview");
    return data;
  },
};
