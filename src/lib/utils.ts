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

// export async function sanitizeSvg(rawSvgString: string): Promise<string | null> {
//   const { JSDOM } = await import("jsdom");

//   try {
//     const window = new JSDOM("").window;

//     const purify = DOMPurify(window);

//     const cleanSvg = purify.sanitize(rawSvgString, {
//       USE_PROFILES: { svg: true, svgFilters: true }
//     });

//     if (cleanSvg.trim() === "") {
//       console.warn("Sanitization resulted in an empty string. Input might have been invalid or purely malicious.");

//       return null;
//     }

//     return cleanSvg;
//   } catch (error) {
//     console.error("Error during SVG sanitization:", error);

//     return null;
//   }
// }

export async function extractAndSanitizeSvg(rawAiResponse: string): Promise<string | null> {
  const svgRegex = /```(?:xml|svg)\n([\s\S]*?)\n```/;
  const match = svgRegex.exec(rawAiResponse);

  if (match?.[1]) {
    const extractedSvg = match[1].trim(); // Get the captured group (SVG code) and trim whitespace
    if (extractedSvg) {
      return extractedSvg;
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
