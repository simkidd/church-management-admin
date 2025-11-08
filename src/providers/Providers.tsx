import React from "react";
import QueryProvider from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import AuthGuard from "@/guards/AuthGuard";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthGuard>{children}</AuthGuard>
      </QueryProvider>
    </ThemeProvider>
  );
};

export default Providers;
