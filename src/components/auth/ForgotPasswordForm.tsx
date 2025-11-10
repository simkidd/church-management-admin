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
import { ApiErrorResponse } from "@/interfaces/response.interface";
import authApi from "@/lib/api/auth.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Define the form schema with Zod
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

const ForgotPasswordForm = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword({ email }),
    onSuccess: (data) => {
      setIsEmailSent(true);
      setSentEmail(form.getValues("email"));
      toast.success("Email Sent", {
        description:
          data.message ||
          "Password reset instructions have been sent to your email.",
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";

      toast.error("Reset Failed", {
        description: errorMessage,
      });
    },
  });

  const onSubmit = (data: FormData) => {
    forgotPasswordMutation.mutate(data.email);
  };

  const isLoading = forgotPasswordMutation.isPending;

  // Success state - email sent
  if (isEmailSent) {
    return (
      <Card className="w-full sm:max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent password reset instructions to
          </CardDescription>
          <p className="font-medium text-sm text-foreground">{sentEmail}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>• Check your spam folder if you don&apos;t see the email</p>
            <p>• The link will expire in 1 hour</p>
            <p>• Follow the instructions in the email to reset your password</p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                setIsEmailSent(false);
                form.reset();
              }}
            >
              Try Another Email
            </Button>

            <Button type="button" variant="outline" className="w-full" asChild>
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4 " />
                Back to Login
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Form state
  return (
    <Card className="w-full sm:max-w-md shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you reset instructions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="forgot-password-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="forgot-email">Email Address</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="forgot-email"
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
          </FieldGroup>
        </form>

        <div className="mt-6 space-y-4">
          <Button
            type="submit"
            form="forgot-password-form"
            className="w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin " />
                Sending Instructions...
              </>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>

          <Button type="button" variant="outline" className="w-full" asChild>
            <Link href="/auth/login">
              <ArrowLeft className="h-4 w-4 " />
              Back to Login
            </Link>
          </Button>
        </div>

        <div className="mt-6 p-3 bg-muted/50 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            You&apos;ll receive an email with a link to reset your password.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordForm;
