import { IUser } from "./user.interface";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor?: IUser;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  isPublished: boolean;
  isFeatured: boolean;
  duration: string;
  category?: string;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ListCourseParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  isPublished?: boolean;
}
