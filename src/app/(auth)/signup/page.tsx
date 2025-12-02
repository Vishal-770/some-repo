import { GalleryVerticalEnd, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SignupForm } from "@/src/components/ui/signup-form";

export default function SignupPage() {
  return (
    <div className="grid lg:grid-cols-2">
      <div className="flex h-svh flex-col gap-3 p-5 md:p-8">
        <div className="flex justify-between items-center md:justify-start">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <a
            href="#"
            className="flex items-center gap-2 font-medium md:ml-auto"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center py-2">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
