"use client";

import { useState } from "react";
import { ArrowLeft, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { FieldDescription, FieldGroup } from "@/src/components/ui/field";
import { cn } from "@/src/lib/utils";
import { authClient } from "@/src/lib/auth-client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/dashboard",
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          toast.success("Redirecting to Google...");
        },
        onError: (ctx) => {
          setLoading(false);
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

      <FieldGroup className="gap-4 p-6 border rounded-lg">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <h1 className="text-xl font-bold">Sign in with Google</h1>
          <p className="text-sm text-muted-foreground">
            Use your Google account to continue. No passwords required.
          </p>
        </div>

        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Redirecting..." : "Continue with Google"}
        </Button>
      </FieldGroup>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our Terms of Service and Privacy Policy.
      </FieldDescription>
    </div>
  );
}
