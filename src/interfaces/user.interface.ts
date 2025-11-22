export interface IUser {
  _id: string;
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
  primaryRole: string
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

export type UpdateUserData = Partial<CreateUserData>;

export interface ListUsersParams {
  page: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export interface RoleStats {
  total: number;
  roles: {
    superAdmin: number;
    admin: number;
    instructor: number;
    pastor: number;
    member: number;
  };
  status: {
    active: number;
    inactive: number;
    suspended: number;
    banned: number;
  };
  verification: {
    verified: number;
    unverified: number;
  };
  percentages: {
    superAdmin: string;
    admin: string;
    instructor: string;
    pastor: string;
    member: string;
  };
}
