import { AuthTokens } from "@/interfaces/auth.interface";
import { IUser } from "@/interfaces/user.interface";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import cookies from "js-cookie";
import { REFRESH_TOKEN_NAME, TOKEN_NAME } from "@/constants/app.constant";

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: IUser | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (tokens) => {
        if (typeof window !== "undefined") {
          cookies.set(TOKEN_NAME, tokens.accessToken);
          cookies.set(REFRESH_TOKEN_NAME, tokens.refreshToken);
        }
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          cookies.remove(TOKEN_NAME);
          cookies.remove(REFRESH_TOKEN_NAME);
        }
        set({ user: null, isAuthenticated: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // ✅ runs after hydration
        state?.setHasHydrated(true);
        state?.setLoading(false);
      },
    }
  )
);
