// src/interfaces/course.interface.ts

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  lessons?: number;
  students?: number;
  category?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  image?: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  duration?: string;
  instructor?: string;
  image?: File | string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  category?: string;
  duration?: string;
  instructor?: string;
  image?: File | string;
}
export interface ListCourseParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
