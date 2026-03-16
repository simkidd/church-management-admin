import { IUser } from "./user.interface";

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor: IUser;
  thumbnail: IMedia;
  introVideo: IMedia;
  duration: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  progressionMode: "free" | "sequential";
  learningObjectives: string[];
}

export interface ICourseEnrol {
  isEnrolled: boolean;
  status: "active" | "completed" | "cancelled" | null;
}

export interface IMedia {
  url: string;
  publicId: string;
}
export interface ListCourseParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "asc" | "desc";
  sortBy?: "createdAt" | "enrolledCount" | "rating" | "title";
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface ICourseEnrollment {
  _id: string;
  user: string;
  course: string;
  enrolledAt: string;
  completedAt: string | null;
  status: "active" | "completed" | "cancelled" | null;
  progressPercentage: number;
  certificateIssued: boolean;
}
