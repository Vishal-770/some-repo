"use client";

import { ThemeProvider } from "../components/theme-provider";
import { Toaster } from "@/src/components/ui/sonner";
import { ModeToggle } from "@/src/components/ModeToggle";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors position="top-center" />
      <div className="fixed bottom-4 right-4 z-50">
        <ModeToggle />
      </div>
    </ThemeProvider>
  );
}
