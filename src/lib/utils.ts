import { Prisma } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { type NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { z, type SafeParseReturnType, type ZodError, type ZodSchema } from "zod";
import { logger } from "./logger";
import { tryCatch } from "./try-catch";

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

export const zDecimal = z
  .union(
    [
      z.number().finite({ message: "Number must be finite." }),
      z.string().refine(
        (val) => {
          try {
            new Prisma.Decimal(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: "Invalid decimal string format." }
      ),
      z.instanceof(Prisma.Decimal)
    ],
    {
      invalid_type_error: "Expected number, valid decimal string, or Decimal instance."
    }
  )
  .transform((val) => (val instanceof Prisma.Decimal ? val : new Prisma.Decimal(val)));

export async function fetchWithTimeout(
  url: RequestInfo | URL,
  options: RequestInit & { timeout?: number } = {}
): Promise<Response> {
  const { timeout = 60000 } = options;

  let urlString: string;
  if (typeof url === "string") {
    urlString = url;
  } else if (url instanceof URL) {
    urlString = url.href;
  } else {
    urlString = url.url;
  }

  const controller = new AbortController();
  const id = setTimeout(() => {
    logger.warn(`Aborting fetch request to ${urlString} due to timeout (${timeout}ms)`);
    controller.abort();
  }, timeout);

  const { data, error } = await tryCatch(
    fetch(urlString, {
      ...options,
      signal: controller.signal
    })
  );
  if (error) {
    logger.error(`Fetch to ${urlString} aborted due to timeout.`);
    throw new Error(`Request timed out after ${timeout}ms`);
  }

  clearTimeout(id);
  return data;
}
