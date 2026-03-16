import { ICourse } from "./course.interface";
import { ILessonWithQuiz, ILessonWithState } from "./lesson.interface";
import { IQuiz, IQuizSummary } from "./quiz.interface";

export interface IModule {
  _id: string;
  course: ICourse;
  title: string;
  description?: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IModuleWithState extends IModule {
  isCompleted: boolean;
  isLockedForUser: boolean;
  progress?: {
    lessonsCompleted: boolean;
    quizPassed: boolean;
    completedAt: string | null;
  };
  lessons: ILessonWithState[];
  quiz: IQuizSummary | null;
}

export interface IModuleWithLessons extends IModule {
  lessons?: ILessonWithQuiz[];
  quiz?: IQuiz; // Module-level assessment
}