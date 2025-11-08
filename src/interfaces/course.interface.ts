export interface ICourse {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  lessons: ILesson[];
  thumbnail?: string;
  isPublished: boolean;
  enrolledStudents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ILesson {
  _id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
}
