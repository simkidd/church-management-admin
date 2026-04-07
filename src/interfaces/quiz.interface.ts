export interface IQuizOption {
  _id: string;
  text: string;
  isCorrect?: boolean;
}

export interface IQuizQuestion {
  _id: string;
  question: string;
  type: QuizQuestionType;
  options: IQuizOption[];
  explanation?: string;
  points: number;
}

export interface IQuiz {
  _id: string;
  course: string;
  module?: string | null;
  lesson?: string | null;
  title: string;
  description?: string;
  scopeType: "lesson" | "module" | "course";
  gradingMode: "auto" | "manual";
  passingScore: number;
  attemptsAllowed: number;
  durationMinutes: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  isPublished: boolean;
  questions: IQuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface IQuizSummary {
  _id: string;
  title: string;
  passingScore: number;
  gradingMode: "auto" | "manual";
  questionsCount: number;
  isPassed: boolean;
  score: number | null;
  status:
    | "in-progress"
    | "submitted"
    | "passed"
    | "failed"
    | "pending-review"
    | null;
  isLockedForUser: boolean;
}

export interface IQuizAttempt {
  _id: string;
  user: string;
  quiz: string;
  course: string;
  module?: string | null;
  lesson?: string | null;
  answers: Array<{
    questionId: string;
    selectedOptions: string[];
    isCorrect?: boolean;
    pointsAwarded?: number;
  }>;
  score: number;
  percentage: number;
  passed: boolean;
  status: "in-progress" | "submitted" | "passed" | "failed" | "pending-review";
  startedAt: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy?: string | null;
  attemptNumber: number;
}

export interface SubmitAnswersResponse {
  attemptId: string;
  score?: number;
  percentage?: number;
  passed?: boolean;
  status: string;
  attemptsLeft: number;
}

export type QuizQuestionType =
  | "single-choice"
  | "multiple-choice"
  | "true-false";

export interface QuizOptionPayload {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionPayload {
  question: string;
  type: QuizQuestionType;
  options: QuizOptionPayload[];
  explanation?: string;
}

export interface CreateQuizPayload {
  course: string;
  module?: string | null;
  lesson?: string | null;
  title: string;
  description?: string;
  scopeType: "lesson" | "module" | "course";
  gradingMode: "auto" | "manual";
  passingScore: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  questions: QuizQuestionPayload[];
}

export interface UpdateQuizPayload {
  title?: string;
  description?: string;
  gradingMode?: "auto" | "manual";
  passingScore?: number;
  attemptsAllowed?: number;
  durationMinutes?: number;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
  isPublished?: boolean;
  questions?: QuizQuestionPayload[];
}
