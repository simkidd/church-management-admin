import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import { ISermon, ListSermonsParams } from "@/interfaces/sermon.interface";
import { AxiosProgressEvent } from "axios";

export const sermonsApi = {
  // Get all sermons with filters
  getAllSermons: async (
    params?: ListSermonsParams
  ): Promise<ApiResponse<PaginatedResponse<ISermon>>> => {
    const response = await api.get("/sermons", { params });
    return response.data;
  },

  // Get sermon by ID
  getSermonById: async (id: string): Promise<ApiResponse<ISermon>> => {
    const response = await api.get(`/sermons/${id}`);
    return response.data;
  },

  // Create sermon
  createSermon: async (
    data: FormData,
    onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined
  ): Promise<ApiResponse<{ sermon: ISermon }>> => {
    const response = await api.post("/sermons/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  },

  // Update sermon
  updateSermon: async (
    id: string,
    data: FormData,
    onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined
  ): Promise<ApiResponse<{ sermon: ISermon }>> => {
    const response = await api.put(`/sermons/${id}/update`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress
    });
    return response.data;
  },

  // Delete sermon
  deleteSermon: async (id: string): Promise<void> => {
    await api.delete(`/sermons/${id}/delete`);
  },

  // Increment view count
  incrementView: async (id: string): Promise<{ views: number }> => {
    const response = await api.post(`/sermons/${id}/increment-view`);
    return response.data;
  },

  // Get popular sermons
  getPopular: async (limit?: number): Promise<ApiResponse<ISermon[]>> => {
    const response = await api.get("/sermons/popular", {
      params: { limit },
    });
    return response.data;
  },

  // Get sermons by preacher
  // getByPreacher: async (
  //   preacherId: string,
  //   params?: PaginationParams
  // ): Promise<SermonListResponse> => {
  //   const response = await api.get(`/sermons/preacher/${preacherId}`, {
  //     params,
  //   });
  //   return response.data;
  // },

  // Generate TTS audio
  generateAudio: async (id: string): Promise<{ audioUrl: string }> => {
    const response = await api.post(`/sermons/${id}/generate-audio`);
    return response.data;
  },

  // Delete audio
  deleteAudio: async (id: string): Promise<void> => {
    await api.delete(`/sermons/${id}/audio`);
  },
};
