export interface ILessonProgressEntry {
  lesson: string;
  module: string;
  contentCompleted: boolean;
  quizPassed: boolean;
  completed: boolean;
  completedAt: string | null;
  watchTimeSeconds: number;
  lastPositionSeconds: number;
}

export interface IModuleProgressEntry {
  module: string;
  lessonsCompleted: boolean;
  quizPassed: boolean;
  completed: boolean;
  completedAt: string | null;
}

export interface IProgress {
  _id: string;
  user: string;
  course: string;
  completedLessons: ILessonProgressEntry[];
  completedModules: IModuleProgressEntry[];
  overallPercentage: number;
  lastAccessedLesson: string | null;
  courseCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProgressStats {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
  courseCompleted: boolean;
}