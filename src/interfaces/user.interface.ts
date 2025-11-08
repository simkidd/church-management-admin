export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: Gender;
  avatar: IAvatar;
  address: string;
  city: string;
  state: string;
  isVerified: boolean;
  status: AccountStatus;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;

  isAdmin: boolean;
  isSuperAdmin: boolean;
  isInstructor: boolean;
  isPastor: boolean;
}

export type Gender = "male" | "female";
export type AccountStatus = "active" | "inactive" | "suspended" | "banned";

export interface IAvatar {
  url: string;
  publicId: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: "male" | "female";
  address?: string;
  city?: string;
  state?: string;
  roles: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateUserData extends Partial<CreateUserData> {}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}
