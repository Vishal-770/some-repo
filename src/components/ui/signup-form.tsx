"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null);
    console.log("Submitting signup form with data:", data);
    await authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/signin",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success("Verification email sent!", {
            description:
              "Please check your inbox and verify your email to continue.",
          });
        },
        onError: (ctx) => {
          setLoading(false);
          setServerError(ctx.error.message);
          toast.error("Signup failed", {
            description: ctx.error.message,
          });
        },
      }
    );
  };

  return (
    <form
      className={cn("flex flex-col gap-4 text-sm", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <FieldGroup className="gap-4">
        <div className="flex flex-col items-center gap-0.5 text-center ">
          <h1 className="text-lg font-semibold">Create your account</h1>
          <p className="text-muted-foreground text-xs">
            Fill in the form to get started
          </p>
        </div>

        {serverError && (
          <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-md text-center">
            {serverError}
          </div>
        )}

        <Field className="gap-2">
          <FieldLabel htmlFor="name">
            Full Name
            {errors.name && (
              <span className="text-destructive ml-1">
                • {errors.name.message}
              </span>
            )}
          </FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className={cn(
              "h-9 text-sm",
              errors.name && "border-destructive focus-visible:ring-destructive"
            )}
            {...register("name", {
              required: "Required",
              minLength: {
                value: 2,
                message: "Min 2 characters",
              },
            })}
          />
        </Field>

        <Field className="gap-2">
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
              "h-9 text-sm",
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

        <Field className="gap-2">
          <FieldLabel htmlFor="password">
            Password
            {errors.password && (
              <span className="text-destructive ml-1">
                • {errors.password.message}
              </span>
            )}
          </FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="8+ chars, include a number"
            className={cn(
              "h-9 text-sm",
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
                message: "Need a number",
              },
            })}
          />
        </Field>

        <Field className="gap-2">
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
            placeholder="Re-enter password"
            className={cn(
              "h-9 text-sm",
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
          <Button
            type="submit"
            size="sm"
            className="h-9 text-sm"
            disabled={loading}
          >
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
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
