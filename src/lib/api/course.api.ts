import {
  ICourse,
  ListCourseParams
} from "@/interfaces/course.interface";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";

export const courseApi = {
  //  GET all courses
  getAllCourses: async (
    params?: ListCourseParams
  ): Promise<ApiResponse<PaginatedResponse<ICourse>>> => {
    const response = await api.get("/courses", { params });
    return response.data;
  },

  // GET single course by ID
  getCourseById: async (id: string): Promise<ApiResponse<ICourse>> => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  //  CREATE a new course
  createCourse: async (
    data: FormData
  ): Promise<ApiResponse<{ course: ICourse }>> => {
    const response = await api.post("/courses/create", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  //  UPDATE a course
  updateCourse: async (
    id: string,
    data: FormData
  ): Promise<ApiResponse<{ course: ICourse }>> => {
    const response = await api.put(`/courses/${id}/update`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // DELETE a course
  deleteCourse: async (
    id: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/courses/${id}/delete`);
    return response.data;
  },
};

export default courseApi;
