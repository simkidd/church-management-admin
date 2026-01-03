import { ApiResponse } from "@/interfaces/response.interface";
import api from "../axios";
import { IQuiz, IQuizByIdResponse } from "@/interfaces/quiz.interface";

export const quizApi = {
  // Create quiz
  createQuiz: async (payload: {
    module: string;
    passingScore: number;
  }): Promise<ApiResponse<IQuiz>> => {
    const response = await api.post("/quizzes/create", payload);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (
    id: string,
    payload: { passingScore: number }
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
  getQuizById: async (
    quizId: string
  ): Promise<ApiResponse<IQuizByIdResponse>> => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  // add question to quiz
  addQuizQuestion: async (payload: {
    quiz: string;
    question: string;
    type: "mcq" | "true-false";
    options?: string[];
    correctAnswerIndex: number;
  }): Promise<ApiResponse<IQuizByIdResponse>> => {
    const response = await api.post(`/quizzes/questions/create`, payload);
    return response.data;
  },

  // update question in quiz
  updateQuizQuestion: async (questionId: string, payload: {
    question: string;
    type: "mcq" | "true-false";
    options?: string[];
    correctAnswerIndex: number;
  }) => {
    const response = await api.put(`/quizzes/question/${questionId}/update`, payload);
    return response.data;
  },

  // delete question from quiz
  deleteQuizQuestion: async (
    questionId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(
      `/quizzes/question/${questionId}/delete`
    );
    return response.data;
  },
};
