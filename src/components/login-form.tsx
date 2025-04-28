"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const handleLogin = async (provider: string) => {
    await signIn(provider);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-2">
        <div className="flex flex-col gap-4">
          <Button variant="default" onClick={() => handleLogin("github")} size="lg" className="text-xl">
            Github
          </Button>
          <Button variant="default" onClick={() => handleLogin("google")} size="lg" className="text-xl">
            Google
          </Button>
        </div>
      </div>
    </div>
  );
}
