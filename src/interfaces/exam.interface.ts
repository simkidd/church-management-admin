import { ICourse } from "./course.interface";

export interface IExam {
  _id: string;
  title: string;
  course: ICourse;
  questions: IQuestion[];
  questionCount?: number;
  passingScore: number;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  submissionCount?: number;
}

export interface IQuestion {
  _id: string;
  questionText: string;
  type: "mcq" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string;
  keywords?: string[];
  points: number;
  order: number;
}

export interface ISubmission {
  _id: string;
  exam: string;
  user: string;
  answers: IAnswer[];
  score: number;
  percentage: number;
  isGraded: boolean;
  isPassed: boolean;
  submittedAt: string;
  gradedAt?: string;
}

export interface IAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface CreateExamData {
  title: string;
  description?: string;
  course: string;
  duration: number;
  passingScore: number;
  isPublished?: boolean;
  questions: Omit<IQuestion, "id">[];
}

export interface UpdateExamData {
  title?: string;
  description?: string;
  duration?: number;
  passingScore?: number;
  isPublished?: boolean;
}

export interface ExamSubmissionData {
  answers: {
    questionId: string;
    answer: string;
  }[];
}

export interface IExamSubmission {
  id: string;
  examId: string;
  userId: string;
  answers: {
    questionId: string;
    answer: string;
    isCorrect?: boolean;
    pointsAwarded?: number;
    feedback?: string;
  }[];
  totalScore: number;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
  overallFeedback?: string;
}

export interface IExamResult {
  exam: IExam;
  submission: IExamSubmission;
  score: number;
  percentage: number;
  passed: boolean;
  rank?: number;
  totalParticipants: number;
}

export interface ManualGradeData {
  gradedAnswers: {
    questionId: string;
    pointsAwarded: number;
    feedback?: string;
  }[];
}

export interface ListExamsParams {
  page: number;
  limit?: number;
  course?: string;
  isPublished?: boolean;
  search?: string;
}

export interface ListExamSubmissonsParams {
  page?: number;
  limit?: number;
  graded?: boolean;
}
