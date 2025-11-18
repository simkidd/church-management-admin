import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import {
  IExam,
  CreateExamData,
  UpdateExamData,
  ExamSubmissionData,
  IExamSubmission,
  IExamResult,
  ManualGradeData,
  ListExamsParams,
  ListExamSubmissonsParams,
  ExamsByCourseResponse,
} from "@/interfaces/exam.interface";
import { QuestionFormData } from "@/components/dashboard/exams/AddQuestionForm";

export const examsApi = {
  // Get all exams
  getExams: async (
    params?: ListExamsParams
  ): Promise<ApiResponse<PaginatedResponse<IExam>>> => {
    const response = await api.get("/exams", { params });
    return response.data;
  },

  // Get exam by ID
  getExamById: async (id: string): Promise<ApiResponse<IExam>> => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // Create exam (Admin/Instructor)
  createExam: async (
    data: CreateExamData
  ): Promise<
    ApiResponse<{
      exam: IExam;
    }>
  > => {
    const response = await api.post("/exams/create", data);
    return response.data;
  },

  // Update exam (Admin/Instructor)
  updateExam: async (
    id: string,
    data: UpdateExamData
  ): Promise<
    ApiResponse<{
      exam: IExam;
    }>
  > => {
    const response = await api.put(`/exams/${id}/update`, data);
    return response.data;
  },

  // Delete exam (Admin only)
  deleteExam: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/exams/${id}/delete`);
    return response.data;
  },

  // Submit exam
  submitExam: async (
    id: string,
    data: ExamSubmissionData
  ): Promise<
    ApiResponse<{
      submission: IExamSubmission;
    }>
  > => {
    const response = await api.post(`/exams/${id}/submit`, data);
    return response.data;
  },

  // Get exam results
  getExamResults: async (
    id: string
  ): Promise<
    ApiResponse<{
      results: IExamResult;
    }>
  > => {
    const response = await api.get(`/exams/${id}/results`);
    return response.data;
  },

  // Get my submission
  getMySubmission: async (
    id: string
  ): Promise<
    ApiResponse<{
      submission: IExamSubmission;
    }>
  > => {
    const response = await api.get(`/exams/${id}/my-submission`);
    return response.data;
  },

  // Get all submissions for exam (Admin/Instructor)
  getExamSubmissions: async (
    id: string,
    params?: ListExamSubmissonsParams
  ): Promise<ApiResponse<PaginatedResponse<IExamSubmission>>> => {
    const response = await api.get(`/exams/${id}/submissions`, { params });
    return response.data;
  },

  // Manual grade submission (Admin/Instructor)
  gradeSubmission: async (
    submissionId: string,
    data: ManualGradeData
  ): Promise<
    ApiResponse<{
      submission: IExamSubmission;
    }>
  > => {
    const response = await api.put(
      `/exams/submissions/${submissionId}/grade`,
      data
    );
    return response.data;
  },

  addQuestion: async (
    examId: string,
    data: QuestionFormData
  ): Promise<ApiResponse<{ exam: IExam }>> => {
    const response = await api.post(`/exams/${examId}/questions/add`, data);
    return response.data;
  },

  updateQuestion: async (
    examId: string,
    questionId: string,
    updates: Record<string, unknown>
  ): Promise<ApiResponse<{ exam: IExam }>> => {
    const response = await api.put(
      `/exams/${examId}/questions/${questionId}`,
      updates
    );
    return response.data;
  },

  deleteQuestion: async (
    examId: string,
    questionId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(
      `/exams/${examId}/questions/${questionId}`
    );
    return response.data;
  },

  getExamsByCourse: async (
    courseId: string,
    params?: {
      page?: number;
      limit?: number;
      isPublished?: boolean;
    }
  ): Promise<ApiResponse<ExamsByCourseResponse>> => {
    const response = await api.get(`/exams/course/${courseId}`, { params });
    return response.data;
  },
};

export default examsApi;
