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
  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  const handleGithubSignUp = async () => {
    setGithubLoading(true);
    await authClient.signIn.social({
      provider: "github",
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
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm w-full"
            type="button"
            onClick={handleGithubSignUp}
            disabled={githubLoading || googleLoading || loading}
          >
            {githubLoading ? (
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
                Connecting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                  />
                </svg>
                Continue with GitHub
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-sm w-full"
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || githubLoading || loading}
          >
            {googleLoading ? (
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
                Connecting...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="mr-2 h-4 w-4"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
          <FieldDescription className="text-center text-xs">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="underline underline-offset-2 hover:text-primary"
            >
              Sign in
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
