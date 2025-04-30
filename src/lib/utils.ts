import { clsx, type ClassValue } from "clsx";
import { type NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { type SafeParseReturnType, type ZodError, type ZodSchema } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validate<T>(payload: T, schema: ZodSchema) {
  const parsedSchema: SafeParseReturnType<T, T> = schema.safeParse(payload);

  return { ...parsedSchema };
}

export async function readBody<T>(req: NextRequest): Promise<T> {
  const rawBody = await req.text();

  return JSON.parse(rawBody) as T;
}

export function formatZodError(error: ZodError) {
  const formattedErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");

    formattedErrors[path] ??= [];
    formattedErrors[path].push(issue.message);
  }

  return formattedErrors;
}

export function scrollPage(by: number, duration: number) {
  const start = window.scrollY;
  const target = start + by;

  if (Math.abs(window.scrollY - target) < 1) return;

  const startTime = performance.now();

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeInOut = 0.5 * (1 - Math.cos(Math.PI * progress));
    window.scrollTo(0, start + by * easeInOut);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}
