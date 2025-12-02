"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setServerError("Invalid or missing reset token");
      toast.error("Invalid link", {
        description: "Please request a new password reset link.",
      });
      return;
    }

    setServerError(null);
    setLoading(true);

    await authClient.resetPassword(
      {
        newPassword: data.password,
        token,
      },
      {
        onSuccess: () => {
          setLoading(false);
          setResetSuccess(true);
          toast.success("Password reset successful!", {
            description: "You can now sign in with your new password.",
          });
        },
        onError: (ctx) => {
          setLoading(false);
          setServerError(ctx.error.message);
          toast.error("Failed to reset password", {
            description: ctx.error.message,
          });
        },
      }
    );
  };

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <svg
              className="size-8 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link href="/forgot-password">
            <Button>Request New Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center p-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <svg
              className="size-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Password Reset Successful!</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Your password has been reset successfully. You can now sign in with
            your new password.
          </p>
          <Link href="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Link
        href="/signin"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Sign In
      </Link>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="size-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Create New Password</h1>
            <FieldDescription>
              Enter your new password below. Make sure it&apos;s strong and
              secure.
            </FieldDescription>
          </div>

          {serverError && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md text-center">
              {serverError}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="password">
              New Password
              {errors.password && (
                <span className="text-destructive ml-1">
                  • {errors.password.message}
                </span>
              )}
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              className={cn(
                errors.password &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("password", {
                required: "Required",
                minLength: {
                  value: 8,
                  message: "Min 8 characters",
                },
                pattern: {
                  value: /^(?=.*[0-9])/,
                  message: "Must contain a number",
                },
              })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirm Password
              {errors.confirmPassword && (
                <span className="text-destructive ml-1">
                  • {errors.confirmPassword.message}
                </span>
              )}
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className={cn(
                errors.confirmPassword &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("confirmPassword", {
                required: "Required",
                validate: (value) =>
                  value === password || "Passwords don't match",
              })}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
