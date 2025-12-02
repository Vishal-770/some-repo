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

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setLoading(true);

    const { error } = await authClient.requestPasswordReset({
      email: data.email,
      redirectTo: "/reset-password",
    });

    setLoading(false);

    if (error) {
      setServerError(error.message || "An error occurred");
      toast.error("Failed to send reset link", {
        description: error.message || "An error occurred",
      });
    } else {
      setEmailSent(true);
      toast.success("Reset link sent!", {
        description: "Please check your email for the password reset link.",
      });
    }
  };

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Link
          href="/signin"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Sign In
        </Link>
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold">Check your email</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-medium text-foreground">
              {getValues("email")}
            </span>
          </p>
          <p className="text-muted-foreground text-xs">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => setEmailSent(false)}
              className="text-primary underline underline-offset-2"
            >
              try again
            </button>
          </p>
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold">Forgot your password?</h1>
            <FieldDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </FieldDescription>
          </div>

          {serverError && (
            <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md text-center">
              {serverError}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">
              Email
              {errors.email && (
                <span className="text-destructive ml-1">
                  • {errors.email.message}
                </span>
              )}
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              className={cn(
                errors.email &&
                  "border-destructive focus-visible:ring-destructive"
              )}
              {...register("email", {
                required: "Required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email",
                },
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
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center">
        Remember your password?{" "}
        <Link
          href="/signin"
          className="underline underline-offset-2 hover:text-primary"
        >
          Sign in
        </Link>
      </FieldDescription>
    </div>
  );
}
