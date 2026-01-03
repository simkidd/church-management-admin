import { IModule } from "./module.interface";
import { IUser } from "./user.interface";

export interface IQuiz {
  _id: string;
  module: IModule;
  passingScore: number;
}

export interface IQuizAttempt {
  user: IUser;
  quiz: IQuiz;

  score: number; // percentage
  passed: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface IQuizQuestion {
  _id: string;
  quiz: IQuiz;
  type: "mcq" | "true-false";
  question: string;
  /**
   * Used ONLY for:
   * - mcq
   * - true-false
   */
  options?: string[];
  /**
   * For:
   * - mcq → index of correct option
   * - true-false → 0 = false, 1 = true
   */
  correctAnswerIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface IQuizByIdResponse {
  quiz: IQuiz;
  questions: IQuizQuestion[];
}
