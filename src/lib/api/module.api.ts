// lib/api/module.api.ts
import { ApiResponse } from "@/interfaces/response.interface";
import api from "../axios";
import { IModule } from "@/interfaces/module.interface";

/* ======================
   Types
====================== */

export interface CreateModulePayload {
  course: string;
  title: string;
  description?: string;
  isPublished: boolean;
}

export interface UpdateModulePayload {
  title?: string;
  description?: string;
  isPublished: boolean;
}

/* ======================
   API
====================== */

export const moduleApi = {
  // Create module
  createModule: async (
    payload: CreateModulePayload,
  ): Promise<ApiResponse<IModule>> => {
    const response = await api.post("/modules/create", payload);
    return response.data;
  },

  // Update module
  updateModule: async (
    id: string,
    payload: UpdateModulePayload,
  ): Promise<ApiResponse<IModule>> => {
    const response = await api.put(`/modules/${id}/update`, payload);
    return response.data;
  },

  // reorder module
  reorderModules: async (payload: {
    courseId: string;
    modules: { id: string; order: number }[];
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.patch(`/modules/reorder`, payload);
    return response.data;
  },

  // Delete module
  deleteModule: async (
    id: string,
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/modules/${id}/delete`);
    return response.data;
  },
};
