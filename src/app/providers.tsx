"use client";

import ErrorBoundaryFallback from "@/components/error-boundry-fallback";
import { PostHogProvider } from "@/components/posthog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

export default function Providers({ children }: { children: ReactNode }) {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange={true}>
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={handleReset}>
        <PostHogProvider>
          <TRPCReactProvider>
            <SessionProvider>
              <Toaster />
              {children}
            </SessionProvider>
          </TRPCReactProvider>
        </PostHogProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
