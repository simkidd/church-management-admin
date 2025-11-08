import authApi from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import cookies from "js-cookie";
import { REFRESH_TOKEN_NAME } from "@/constants/app.constant";

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refreshToken = cookies.get(REFRESH_TOKEN_NAME);
      return authApi.logout(refreshToken);
    },
    onSuccess: () => {
      handleLogout();
    },
    onError: () => {
      // Force logout even if API call fails
      handleLogout();
    },
  });

  function handleLogout() {
    // Use replace instead of push to avoid adding to history
    router.replace("/auth/login");

    // Clear data after navigation
    setTimeout(() => {
      clearAuth();
      queryClient.clear();
    }, 100); // Even 0ms delay helps
  }
};
