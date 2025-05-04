import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

const isDevelopment = process.env.NODE_ENV === "development";

export type FallbackProps = {
  error: unknown;
  resetErrorBoundary: (...args: unknown[]) => void;
};

export default function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
  let errorMessage = "An unexpected error occurred.";
  let errorStack: string | undefined = undefined;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    errorMessage = error.message;
  }

  return (
    <div
      role="alert"
      className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4" // Center content vertically/horizontally
    >
      <div className="border-border bg-card w-full max-w-md rounded-md border p-6 shadow-md">
        <div className="space-y-4 text-center">
          <div className="bg-destructive/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>

          <h2 className="text-card-foreground text-xl font-semibold">Oops! Something went wrong.</h2>

          {isDevelopment ? (
            <div className="space-y-3 text-left">
              <p className="text-muted-foreground text-sm">
                An unexpected error occurred. Here are the details for debugging:
              </p>
              <pre className="border-border bg-muted text-destructive overflow-x-auto rounded-md border p-3 text-xs">
                <code>{errorMessage ?? "No error message available."}</code>
              </pre>
              {errorStack && (
                <details className="text-muted-foreground text-xs">
                  <summary className="cursor-pointer">View Stack Trace</summary>
                  <pre className="border-border bg-muted mt-2 overflow-x-auto rounded-md border p-3">
                    <code>{errorStack}</code>
                  </pre>
                </details>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              We encountered an unexpected issue. Please try again, or contact support if the problem persists.
              We&apos;ve been notified of the problem.
            </p>
          )}

          <Button
            onClick={resetErrorBoundary}
            className="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring mt-4 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
