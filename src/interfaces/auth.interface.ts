import { Gender } from "./user.interface";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: "instructor" | "member";
  gender: Gender;
  address?: string;
  city?: string;
  state?: string;
}
