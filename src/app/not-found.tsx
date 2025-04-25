import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <p className="text-6xl font-extrabold tracking-tight text-primary sm:text-8xl">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Page Not Found</h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        Oops! It seems like the page you`&apos;`re looking for doesn`&apos;`t exist or may have been moved.
      </p>

      <div className="mt-8">
        <Button asChild size="lg">
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
