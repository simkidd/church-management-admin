import { IUser } from "./user.interface";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor?: IUser;
  lessons?: ILesson[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  isPublished: boolean;
  enrolledStudents: IUser[];
  duration: string;
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

export interface ListCourseParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  isPublished?: boolean;
}
