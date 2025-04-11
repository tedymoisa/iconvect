"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { SessionProvider } from "next-auth/react";
import { type ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true} disableTransitionOnChange={true}>
      <TRPCReactProvider>
        <SessionProvider>{children}</SessionProvider>
      </TRPCReactProvider>
    </ThemeProvider>
  );
}
