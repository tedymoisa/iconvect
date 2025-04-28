import { clsx, type ClassValue } from "clsx";
import { type NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";
import { type SafeParseReturnType, type ZodError, type ZodSchema } from "zod";
import DOMPurify from "isomorphic-dompurify";

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
  if (!rawAiResponse || typeof rawAiResponse !== "string") {
    console.warn("Invalid input provided for SVG extraction.");
    return null;
  }

  let potentialSvg: string | null = null;

  const fenceRegex = /```(?:xml|svg)\s*([\s\S]*?)\s*```/;
  const fenceMatch = fenceRegex.exec(rawAiResponse);

  if (fenceMatch?.[1]) {
    potentialSvg = fenceMatch[1].trim();
  } else {
    const rawSvgRegex = /<svg[\s\S]*?<\/svg>/i;
    const rawMatch = rawSvgRegex.exec(rawAiResponse);
    if (rawMatch?.[0]) {
      potentialSvg = rawMatch[0].trim();
    }
  }

  if (!potentialSvg) {
    console.warn("Could not extract SVG code using fence or raw tag regex.", {
      rawInputSnippet: rawAiResponse.substring(0, 100) + "..."
    });
    return null;
  }

  if (potentialSvg.length === 0) {
    console.warn("Extracted potential SVG content is empty.");
    return null;
  }

  try {
    const sanitizedSvg = DOMPurify.sanitize(potentialSvg, {
      USE_PROFILES: { svg: true, svgFilters: true }
    });

    if (!sanitizedSvg || sanitizedSvg.trim().length === 0) {
      console.error("SVG Sanitization resulted in an empty string.", {
        originalSnippet: potentialSvg.substring(0, 100) + "..."
      });
      return null;
    }

    return sanitizedSvg;
  } catch (error) {
    console.error("Error during SVG sanitization:", error);
    return null;
  }
}
