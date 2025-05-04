import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-[calc(100vh-(--spacing(16)))] flex-col items-center justify-center px-4 py-12 text-center sm:px-6 lg:px-8">
      <p className="text-primary text-6xl font-extrabold tracking-tight sm:text-8xl">404</p>
      <h1 className="text-foreground mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Page Not Found</h1>
      <p className="text-muted-foreground mt-4 max-w-md text-base">
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
