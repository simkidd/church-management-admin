import {
  ApiResponse,
  PaginatedResponse,
} from "@/interfaces/response.interface";
import api from "../axios";
import {
  CreateUserData,
  IUser,
  ListUsersParams,
  RoleStats,
  UpdateUserData,
} from "@/interfaces/user.interface";

export const usersApi = {
  // Get all users
  getUsers: async (
    params?: ListUsersParams
  ): Promise<ApiResponse<PaginatedResponse<IUser>>> => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<ApiResponse<IUser>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (
    data: CreateUserData
  ): Promise<
    ApiResponse<{
      user: IUser;
    }>
  > => {
    const response = await api.post("/users/create", data);
    return response.data;
  },

  // Update user
  updateUser: async (
    id: string,
    data: UpdateUserData
  ): Promise<
    ApiResponse<{
      user: IUser;
    }>
  > => {
    const response = await api.put(`/users/${id}/update`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Update user avatar
  updateUserAvatar: async (
    id: string,
    avatarFile: File
  ): Promise<
    ApiResponse<{
      user: IUser;
    }>
  > => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.patch(`/users/${id}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete user avatar
  deleteUserAvatar: async (
    id: string
  ): Promise<
    ApiResponse<{
      user: IUser;
    }>
  > => {
    const response = await api.delete(`/users/${id}/avatar`);
    return response.data;
  },

  // Get roles stats
  getRolesStats: async (): Promise<ApiResponse<RoleStats>> => {
    const response = await api.get("/users/stats/roles");
    return response.data;
  },

  /**
   * Get instructors list (for dropdowns)
   */
  getInstructorsList: async (params?: {
    search?: string;
    status?: string;
  }): Promise<ApiResponse<IUser[]>> => {
    const response = await api.get("/users/instructors/list", { params });
    return response.data;
  },

  /**
   * Update user roles
   */
  updateUserRoles: async (
    id: string,
    data: { roles: string[] }
  ): Promise<ApiResponse<IUser>> => {
    const response = await api.patch(`/users/${id}/roles`, data);
    return response.data;
  },
};

export default usersApi;
