import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import {
  ICourse,
  CreateCourseData,
  UpdateCourseData,
  ListCourseParams,
} from "@/interfaces/course.interface";

export const courseApi = {
  // 📚 Get all courses (with pagination and filters)
  getCourses: async (
    params?: ListCourseParams
  ): Promise<ApiResponse<PaginatedResponse<ICourse>>> => {
    const response = await api.get("/courses", { params });
    return response.data;
  },

  // 📘 Get course by ID
  getCourseById: async (
    id: string
  ): Promise<
    ApiResponse<{
      course: ICourse;
    }>
  > => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  // ✳️ Create new course
  createCourse: async (
    data: CreateCourseData
  ): Promise<
    ApiResponse<{
      course: ICourse;
    }>
  > => {
    const response = await api.post("/courses/create", data);
    return response.data;
  },

  // 📝 Update existing course
  updateCourse: async (
    id: string,
    data: UpdateCourseData
  ): Promise<
    ApiResponse<{
      course: ICourse;
    }>
  > => {
    const response = await api.put(`/courses/${id}/update`, data);
    return response.data;
  },

  // ❌ Delete course
  deleteCourse: async (
    id: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  // 🖼️ Upload or update course image
  updateCourseImage: async (
    id: string,
    imageFile: File
  ): Promise<
    ApiResponse<{
      course: ICourse;
    }>
  > => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await api.patch(`/courses/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // 🚫 Delete course image
  deleteCourseImage: async (
    id: string
  ): Promise<
    ApiResponse<{
      course: ICourse;
    }>
  > => {
    const response = await api.delete(`/courses/${id}/image`);
    return response.data;
  },
};

export default courseApi;
