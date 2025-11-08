export interface IExam {
  _id: string;
  title: string;
  course: string;
  questions: IQuestion[];
  passingScore: number;
  duration: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IQuestion {
  _id: string;
  questionText: string;
  type: 'mcq' | 'true-false' | 'short-answer';
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