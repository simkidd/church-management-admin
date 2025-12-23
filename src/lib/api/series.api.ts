// api/sermons.api.ts (or series.api.ts if you want to split later)
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import { ISeries, ListSeriesParams } from "@/interfaces/series.interface";
import { AxiosProgressEvent } from "axios";
import { ISermon } from "@/interfaces/sermon.interface";

export const seriesApi = {
  // Get all series
  getAllSeries: async (
    params?: ListSeriesParams
  ): Promise<ApiResponse<PaginatedResponse<ISeries>>> => {
    const response = await api.get("/series", { params });
    return response.data;
  },

  // Get series by ID
  getSeriesById: async (id: string): Promise<ApiResponse<ISeries>> => {
    const response = await api.get(`/series/${id}`);
    return response.data;
  },

  // Get series by slug (SEO)
  getSeriesBySlug: async (slug: string): Promise<ApiResponse<ISeries>> => {
    const response = await api.get(`/series/slug/${slug}`);
    return response.data;
  },

  getSeriesList: async (): Promise<ApiResponse<ISeries[]>> => {
    const response = await api.get(`/series/list`);
    return response.data;
  },

  getSermonsBySeries: async (
    seriesId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<ISermon>>> => {
    const response = await api.get(`/series/${seriesId}/sermons`, { params });
    return response.data;
  },

  // Create series
  createSeries: async (
    data: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<ApiResponse<ISeries>> => {
    const response = await api.post("/series/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  },

  // Update series
  updateSeries: async (
    id: string,
    data: FormData,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
  ): Promise<ApiResponse<ISeries>> => {
    const response = await api.put(`/series/${id}/update`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  },

  // Delete series
  deleteSeries: async (id: string): Promise<void> => {
    await api.delete(`/series/${id}/delete`);
  },
};
