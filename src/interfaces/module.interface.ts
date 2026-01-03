import { ICourse } from "./course.interface";
import { ILesson } from "./lesson.interface";

export interface IModule {
  _id: string;
  course: ICourse;
  title: string;
  order: number;
  quiz?: string;
}

export interface IModuleWithLessons extends IModule {
  lessons?: ILesson[];
}