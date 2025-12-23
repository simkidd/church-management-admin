import { IMedia } from "./sermon.interface";
import { IUser } from "./user.interface";

// interfaces/series.interface.ts
export interface ISeries {
  _id: string;
  title: string;
  slug: string;
  description?: string;

  thumbnail?: IMedia;

  isPublished: boolean;
  isFeatured: boolean;

  createdBy: IUser;

  createdAt: string;
  updatedAt: string;
}

export interface ListSeriesParams {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
}
