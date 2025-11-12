// src/interfaces/course.interface.ts

import { IUser } from "./user.interface";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor?: IUser;
  lessons?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  isPublished: boolean;
  enrolledStudents: IUser[];
  duration: number;
}

export interface ILesson {
  _id: string;
  title: string;
  content: string;
  video?: {
    url: string;
    publicId: string;
  };
  duration?: number;
  order: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  instructor: string;
  isPublished: boolean;
  thumbnail?: File | string;
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
  sortOrder?: "asc" | "desc";
  isPublished?: boolean;
}
