// lib/api/event.api.ts
import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import { IEvent, ListEventsParams } from "@/interfaces/event.interface";
import { AxiosProgressEvent } from "axios";

export const eventsApi = {
  // Get all events with filters
  getAllEvents: async (
    params?: ListEventsParams
  ): Promise<ApiResponse<PaginatedResponse<IEvent>>> => {
    const response = await api.get("/events", { params });
    return response.data;
  },

  // Get event by ID
  getEventById: async (id: string): Promise<ApiResponse<IEvent>> => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create event
  createEvent: async (
    data: FormData,
    onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined
  ): Promise<ApiResponse<{ event: IEvent }>> => {
    const response = await api.post("/events/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  },

  // Update event
  updateEvent: async (
    id: string,
    data: FormData,
    onUploadProgress?: ((progressEvent: AxiosProgressEvent) => void) | undefined
  ): Promise<ApiResponse<{ event: IEvent }>> => {
    const response = await api.put(`/events/${id}/update`, data, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress,
    });
    return response.data;
  },

  // Delete event
  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/delete`);
  },

  // Register for event
  registerForEvent: async (id: string): Promise<ApiResponse<IEvent>> => {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  // Unregister from event
  unregisterFromEvent: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}/unregister`);
  },

  // Get user's registered events
  // getUserRegisteredEvents: async (
  //   params?: any
  // ): Promise<ApiResponse<PaginatedResponse<IEvent>>> => {
  //   const response = await api.get("/events/user/registered", { params });
  //   return response.data;
  // },

  // Get events created by user
  // getUserCreatedEvents: async (
  //   params?: any
  // ): Promise<ApiResponse<PaginatedResponse<IEvent>>> => {
  //   const response = await api.get("/events/user/created", { params });
  //   return response.data;
  // },

  // Get event attendees
  // getEventAttendees: async (id: string): Promise<ApiResponse<any>> => {
  //   const response = await api.get(`/events/${id}/attendees`);
  //   return response.data;
  // },
};
