import { IUser } from "./user.interface";

export interface ISermon {
  _id: string;
  title: string;
  slug: string;
  description: string;
  keyTakeaways?: string[];
  series?: {
    _id: string;
    title: string;
    slug: string;
  };
  preacher: IUser;
  video: IMedia;
  audioUrl?: string | null;
  thumbnail?: IMedia | null;
  datePreached: string;
  duration?: number;
  scripture?: string;
  tags?: string[];
  category?: string;
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface IMedia {
  url: string;
  publicId: string;
}

export interface CreateSermonData {
  title: string;
  description: string;
  preacher: string;
  audioUrl?: string;
  datePreached: string;
  scripture?: string;
  tags?: string[];
  isPublished?: boolean;
  video?: File;
  thumbnail?: File;
}

export interface UpdateSermonData {
  title?: string;
  description?: string;
  preacher?: string;
  audioUrl?: string | null;
  datePreached?: string;
  scripture?: string;
  tags?: string[];
  isPublished?: boolean;
  removeThumbnail?: boolean;
  video?: File;
  thumbnail?: File;
}

export interface ListSermonsParams {
  page: number;
  limit?: number;
  preacher?: string;
  search?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
  sortBy?: string;
  sortOrder?: string;
}
