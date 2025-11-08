"use client";

import { useUser } from "@/hooks/use-user";
import { useAuthStore } from "@/stores/auth.store";
import React, { useEffect } from "react";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useAuthStore();
  const { data } = useUser();

  // Update store when user data is fetched
  useEffect(() => {
    if (data?.data) {
      setUser(data.data);
    }
  }, [data, setUser]);

  return <>{children}</>;
};

export default AuthGuard;
