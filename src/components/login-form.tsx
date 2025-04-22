"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import { signIn } from "next-auth/react";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const handleLogin = async (provider: string) => {
    await signIn(provider);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Github or Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button variant="outline" className="w-full" onClick={() => handleLogin("github")}>
              <Github />
              Login with Github
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
