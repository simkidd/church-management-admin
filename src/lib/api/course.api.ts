import { ICourse, ListCourseParams } from "@/interfaces/course.interface";
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import { IModuleWithLessons } from "@/interfaces/module.interface";

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

  // get course modules
  getCourseModules: async (
    courseId: string
  ): Promise<
    ApiResponse<{
      course: ICourse;
      modules: IModuleWithLessons[];
    }>
  > => {
    const response = await api.get(`/courses/${courseId}/modules`);
    return response.data;
  },

  // add lesson
  addLesson: async (
    courseId: string,
    data: FormData,
    onProgress?: (progress: number) => void
  ) => {
    const response = await api.post(`/courses/${courseId}/lessons`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  //  UPDATE a Lesson
  updateLesson: async (
    courseId: string,
    lessonId: string,
    data: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ course: ICourse }>> => {
    const response = await api.put(
      `/courses/${courseId}/lessons/${lessonId}/update`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      }
    );
    return response.data;
  },

  // DELETE a Lesson
  deleteLesson: async (
    courseId: string,
    lessonId: string
  ): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(
      `/courses/${courseId}/lessons/${lessonId}/delete`
    );
    return response.data;
  },
};

export default courseApi;
