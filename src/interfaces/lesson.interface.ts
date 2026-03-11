import { ICourse } from "./course.interface";
import { IModule } from "./module.interface";
import { IQuiz, IQuizSummary } from "./quiz.interface";

export interface ILessonContent {
  videoUrl?: string;
  audioUrl?: string;
  textContent?: string;
}

export interface ILesson {
  _id: string;
  course: ICourse;
  module: IModule;
  title: string;
  description?: string;
  type: "video" | "article" | "audio";
  content: ILessonContent;
  order: number;
  durationSeconds: number;
  isPreview: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ILessonProgress {
  contentCompleted: boolean;
  quizPassed: boolean;
  completed: boolean;
  completedAt: string | null;
  watchTimeSeconds: number;
  lastPositionSeconds: number;
}

export interface ILessonWithState extends ILesson {
  isCompleted: boolean;
  isLockedForUser: boolean;
  progress: ILessonProgress;
  quiz: IQuizSummary | null;
}

export interface ILessonWithQuiz extends ILesson {
  quiz?: IQuiz; // Lesson-level check/quiz
}