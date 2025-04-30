import { tryCatch } from "@/lib/try-catch";
import DOMPurify from "dompurify";

export const svgService = {
  sanitizeSvg: async (rawAiResponse: string): Promise<string> => {
    if (!rawAiResponse || typeof rawAiResponse !== "string") {
      throw new Error("Invalid input provided for SVG extraction.");
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
      throw new Error("Could not extract SVG code using fence or raw tag regex.");
    }

    if (potentialSvg.length === 0) {
      throw new Error("Extracted potential SVG content is empty.");
    }

    const { data: sanitizedSvg, error } = await tryCatch(
      Promise.resolve(
        DOMPurify.sanitize(potentialSvg, {
          USE_PROFILES: { svg: true, svgFilters: true }
        })
      )
    );

    if (error) {
      throw new Error(`Error during SVG sanitization: ${error.message}`);
    }

    if (!sanitizedSvg || sanitizedSvg.trim().length === 0) {
      throw new Error("SVG Sanitization resulted in an empty string.");
    }

    return sanitizedSvg;
  }
};
