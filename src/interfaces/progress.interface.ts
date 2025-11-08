import { ICourse } from "./course.interface";

export interface IProgress {
  _id: string;
  user: string;
  course: ICourse;
  lessonsProgress: ILessonProgress[];
  overallProgress: number;
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt?: string;
  certificateIssued: boolean;
}

export interface ILessonProgress {
  lessonId: string;
  isCompleted: boolean;
  completedAt?: string;
  timeSpent?: number;
}