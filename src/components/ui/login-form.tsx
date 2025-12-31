"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GalleryVerticalEnd, ArrowLeft } from "lucide-react";
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

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    await authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => {
          setLoading(true);
        },
        onSuccess: () => {
          setLoading(false);
          toast.success("Welcome back!", {
            description: "You have been signed in successfully.",
          });
          window.location.href = "/dashboard";
        },
        onError: (ctx) => {
          setLoading(false);
          setServerError(ctx.error.message);
          toast.error("Sign in failed", {
            description: ctx.error.message,
          });
        },
      }
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Home
      </Link>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to Acme Inc.</h1>
            <FieldDescription>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="underline underline-offset-2 hover:text-primary"
              >
                Sign up
              </Link>
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
              placeholder="Enter your password"
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
              })}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2"
              >
                Forgot password?
              </Link>
            </div>
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
