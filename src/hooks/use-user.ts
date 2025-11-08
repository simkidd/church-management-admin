import { TOKEN_NAME } from "@/constants/app.constant";
import authApi from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { useQuery } from "@tanstack/react-query";
import cookies from "js-cookie";

export function useUser() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: authApi.getCurrentUser,
    enabled: !!cookies.get(TOKEN_NAME) && !user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}
