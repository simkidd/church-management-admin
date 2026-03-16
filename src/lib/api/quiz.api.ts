import {
  CreateQuizPayload,
  IQuiz,
  UpdateQuizPayload,
} from "@/interfaces/quiz.interface";
import { ApiResponse } from "@/interfaces/response.interface";
import api from "../axios";

export const quizApi = {
  // Create quiz
  createQuiz: async (
    payload: CreateQuizPayload,
  ): Promise<ApiResponse<IQuiz>> => {
    const response = await api.post("/quizzes/create", payload);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (
    id: string,
    payload: UpdateQuizPayload,
  ): Promise<ApiResponse<IQuiz>> => {
    const response = await api.put(`/quizzes/${id}/update`, payload);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/quizzes/${id}/delete`);
    return response.data;
  },

  // Get quiz by module
  getQuizByModule: async (moduleId: string): Promise<ApiResponse<IQuiz>> => {
    const response = await api.get(`/quizzes/module/${moduleId}`);
    return response.data;
  },

  // get quiz by id
  getQuizById: async (quizId: string): Promise<ApiResponse<IQuiz>> => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },
};
