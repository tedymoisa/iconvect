import { clsx, type ClassValue } from "clsx";
import { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { SafeParseReturnType, ZodError, ZodSchema } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validate<T>(payload: T, schema: ZodSchema) {
  const parsedSchema: SafeParseReturnType<T, T> = schema.safeParse(payload);

  return { ...parsedSchema };
}

export async function readBody<T>(req: NextRequest): Promise<T> {
  try {
    const rawBody = await req.text();

    return JSON.parse(rawBody) as T;
  } catch (error) {
    throw new Error("Failed to parse request body as JSON");
  }
}

export function formatZodError(error: ZodError) {
  const formattedErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  }

  return formattedErrors;
}
