import { LoginCredentials, RegisterData } from "@/interfaces/auth.interface";
import api from "../axios";
import { ApiResponse } from "@/interfaces/response.interface";
import { IUser } from "@/interfaces/user.interface";

export const authApi = {
  // Public routes
  register: async (
    payload: RegisterData
  ): Promise<
    ApiResponse<{
      user: IUser;
      accessToken: string;
    }>
  > => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  login: async (
    payload: LoginCredentials
  ): Promise<
    ApiResponse<{
      user: IUser;
      accessToken: string;
      refreshToken: string;
    }>
  > => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const { data } = await api.post("/auth/verify", { token });
    return data;
  },

  // refreshToken: async (payload: RefreshTokenPayload): Promise<AuthResponse> => {
  //   const { data } = await api.post("/auth/refresh", payload);
  //   return data;
  // },

  // forgotPassword: async (
  //   payload: ForgotPasswordPayload
  // ): Promise<{ message: string }> => {
  //   const { data } = await api.post("/auth/forgot-password", payload);
  //   return data;
  // },

  // resetPassword: async (
  //   payload: ResetPasswordPayload
  // ): Promise<{ message: string }> => {
  //   const { data } = await api.post("/auth/reset-password", payload);
  //   return data;
  // },

  // Protected routes
  logout: async (refreshToken?: string): Promise<{ message: string }> => {
    const { data } = await api.post("/auth/logout", { refreshToken });
    return data;
  },

  getCurrentUser: async (): Promise<{ data: IUser }> => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  // changePassword: async (
  //   payload: ChangePasswordPayload
  // ): Promise<{ message: string }> => {
  //   const { data } = await api.put("/auth/change-password", payload);
  //   return data;
  // },
};

export default authApi;
