import { REFRESH_TOKEN_NAME, TOKEN_NAME } from "@/constants/app.constant";
import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import cookies from "js-cookie";
import authApi from "./api/auth.api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// List of endpoints that should NOT trigger token refresh
const AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  // "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Check if the request is for an auth endpoint
const isAuthEndpoint = (url: string = "") => {
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = cookies.get(TOKEN_NAME);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't intercept auth endpoints (login, register, etc.)
    if (originalRequest.url && isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (typeof window !== "undefined") {
          const refreshToken = cookies.get(REFRESH_TOKEN_NAME);

          if (!refreshToken) {
            throw new Error("No refresh token");
          }

          const res = await authApi.refreshToken({ refreshToken });
          const { accessToken } = res.data;

          cookies.set(TOKEN_NAME, accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        cookies.remove(TOKEN_NAME);
        cookies.remove(REFRESH_TOKEN_NAME);

        if (typeof window !== "undefined") {
          // Only redirect if it's not an auth-related page
          if (!window.location.pathname.includes("/auth/")) {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
