import { clsx, type ClassValue } from "clsx";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
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
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  }

  return formattedErrors;
}

export function sanitizeSvg(rawSvgString: string | null | undefined): string | null {
  if (!rawSvgString || typeof rawSvgString !== "string") {
    console.warn("Invalid input provided for SVG sanitization.");
    return null;
  }

  try {
    const window = new JSDOM("").window;

    const purify = DOMPurify(window);

    const cleanSvg = purify.sanitize(rawSvgString, {
      USE_PROFILES: { svg: true, svgFilters: true }
    });

    if (cleanSvg.trim() === "") {
      console.warn("Sanitization resulted in an empty string. Input might have been invalid or purely malicious.");

      return null;
    }

    return cleanSvg;
  } catch (error) {
    console.error("Error during SVG sanitization:", error);
    return null; // Return null on failure
  }
}

export function extractAndSanitizeSvg(rawAiResponse: string | null | undefined): string | null {
  if (!rawAiResponse || typeof rawAiResponse !== "string") {
    console.warn("Invalid input provided for SVG extraction.");
    return null;
  }

  // Regex to match ```xml...``` or ```svg...``` and capture the content
  const svgRegex = /```(?:xml|svg)\n([\s\S]*?)\n```/;
  const match = svgRegex.exec(rawAiResponse);

  if (match?.[1]) {
    const extractedSvg = match[1].trim(); // Get the captured group (SVG code) and trim whitespace
    if (extractedSvg) {
      // Sanitize the extracted SVG code
      return sanitizeSvg(extractedSvg);
    } else {
      console.warn("Extracted SVG content is empty.");
      return null;
    }
  } else {
    console.warn("Could not extract SVG code from the provided string using regex.");
    // Optional: Fallback - If no markdown block, try sanitizing the whole input?
    // Be cautious with this, it might sanitize non-SVG text unnecessarily.
    // console.warn('Attempting to sanitize the entire input as SVG...');
    // return sanitizeSvg(rawAiResponse.trim());
    return null; // Recommended: Return null if extraction fails
  }
}
