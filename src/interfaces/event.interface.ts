import { IUser } from "./user.interface";

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  time: string;
  location: string;
  requiresRegistration: boolean;
  maxAttendees?: number;
  registeredUsers: IUser[];
  image?: IMedia | null;
  isPublished: boolean;
  isFeatured: boolean;
  createdBy: IUser;
  isMultiDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IMedia {
  url: string;
  publicId: string;
}

export interface ListEventsParams {
  page: number;
  limit?: number;
  search?: string;
  upcoming?: boolean;
  past?: boolean;
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
  requiresRegistration?: boolean;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  eventsRequiringRegistration: number;
}
