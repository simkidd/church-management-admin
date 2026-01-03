// lib/api/lesson.api.ts
import { ApiResponse } from "@/interfaces/response.interface";
import api from "../axios";
import { ILesson } from "@/interfaces/lesson.interface";

export const lessonApi = {
  // Create lesson
  create: async (payload: FormData): Promise<ApiResponse<ILesson>> => {
    const response = await api.post("/lessons/create", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update lesson
  update: async (
    id: string,
    payload: FormData
  ): Promise<ApiResponse<ILesson>> => {
    const response = await api.put(`/lessons/${id}/update`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  // Delete lesson
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/lessons/${id}/delete`);
    return response.data;
  },

  // reorder lesson
  reorderLesson: async (payload: {
    moduleId: string;
    lessons: { id: string; order: number }[];
  }): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.put(`/lessons/reorder`, payload);
    return response.data;
  },

  /**
   * Get lessons by module (locked per user)
   */
  getByModule: async (moduleId: string): Promise<ApiResponse<ILesson[]>> => {
    const response = await api.get(`/lessons/module/${moduleId}`);
    return response.data;
  },

  // Mark lesson complete (students)
  // complete: async (lessonId: string): Promise<ApiResponse<ILesson>> => {
  //   const response = await api.post(`/lessons/${lessonId}/complete`);
  //   return response.data;
  // },
};
