import { env } from "@/env";
import { MOCK_SVG } from "@/lib/constants";
import { tryCatch } from "@/lib/try-catch";
import { geminiClient } from "@/server/gemini";
import { svgService } from "@/server/services/svg-service";
import { type GenerationConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const defaultModel = "gemini-1.5-flash-latest";
const systemInstruction = `
Act as an SVG code generator. Strict rules to be followed:
1. Default style for elements: xmlns='http://www.w3.org/2000/svg', viewBox='0 0 24 24', fill='currentColor', stroke-width='1'. Apply unless prompt specifies otherwise.
2. Design: Complex and iconic but visually clear. Define and separate shapes effectively using thin strokes or white spaces.
3. Output ONLY raw SVG code, starting precisely with '<svg>' and ending precisely with '</svg>'.
4. Don't add comments or explanations inside the output. The entire response must be only the SVG code itself.
`;
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
const generationConfig: GenerationConfig = {
  temperature: 0.4,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain"
};

export const geminiRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt cannot be empty").max(255, "Prompt is too long")
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { prompt } = input;

      console.log(`User ${userId} generating SVG with prompt: "${prompt}"`);

      if (env.NODE_ENV === "development") {
        return MOCK_SVG;
      }

      // 1. Gemini API call
      const { data: result, error: geminiError } = await tryCatch(
        geminiClient.models.generateContent({
          model: env.GOOGLE_GEMINI_MODEL ?? defaultModel,
          contents: {
            role: "user",
            parts: [{ text: prompt }]
          },
          config: {
            systemInstruction: [{ text: systemInstruction }],
            thinkingConfig: { includeThoughts: false },
            ...generationConfig,
            ...safetySettings
          }
        })
      );

      if (geminiError) {
        console.error("Gemini API Error:", geminiError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG: Error from AI model.",
          cause: geminiError
        });
      }

      const candidate = result.candidates?.[0];
      if (!candidate) {
        console.error("Gemini Error: No candidates found in response.", result);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG: No response from AI model."
        });
      }

      const part = candidate.content?.parts?.[0];
      const rawSvg = part?.text;

      if (!rawSvg || typeof rawSvg !== "string" || rawSvg.trim().length === 0) {
        console.error("Gemini Error: No text part found in the candidate.", candidate);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG: Empty response from AI model."
        });
      }

      console.log("Raw SVG received from Gemini:", rawSvg.substring(0, 100));

      // 2. Sanitize SVG
      const { data: sanitizedSvg, error: sanitizeError } = await tryCatch(svgService.sanitizeSvg(rawSvg));
      if (sanitizeError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Generated SVG was invalid or could not be sanitized.",
          cause: sanitizeError
        });
      }

      console.log("SVG sanitized correctly.");

      return sanitizedSvg;
    })
});
