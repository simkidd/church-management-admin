"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LoginCredentials } from "@/interfaces/auth.interface";
import { ApiErrorResponse } from "@/interfaces/response.interface";
import { IUser } from "@/interfaces/user.interface";
import authApi from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { hasDashboardAccess } from "@/utils/helpers/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Define the form schema with Zod
const formSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { setUser, setTokens } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  const redirectUrl = searchParams.get("redirect");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: (payload: LoginCredentials) => authApi.login(payload),
    onSuccess: (data) => {
      const { user, accessToken, refreshToken } = data.data;

      if (!hasDashboardAccess(user)) {
        toast.error("Access Denied", {
          description:
            "You don't have permission to access the dashboard. Please contact an administrator.",
        });
        return;
      }

      // Update store
      setUser(user);
      setTokens({ accessToken, refreshToken });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["auth"] });

      toast.success(data.message, {
        description: `Welcome back, ${user.firstName}! Redirecting to your dashboard...`,
      });

      window.location.href = redirectUrl || "/dashboard";
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      // You can handle specific error messages here
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error("Login Failed", {
        description: errorMessage,
      });

      console.error("Login error:", error);
    },
  });

  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  const isLoading = loginMutation.isPending;

  return (
    <Card className="w-full sm:max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Admin Dashboard
        </CardTitle>
        <CardDescription className="text-center">
          Sign in with your authorized account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-email">Email</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="admin@church.org"
                      className="pl-10"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="px-10"
                      aria-invalid={fieldState.invalid}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />

                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <div className="mt-6 space-y-4">
          <Button
            type="submit"
            form="login-form"
            className="w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </Button>
        </div>

        <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">Admin access required</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
