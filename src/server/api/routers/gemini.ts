import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { geminiClient } from "@/server/gemini";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import { extractAndSanitizeSvg } from "@/lib/utils";

const defaultModel = "gemini-1.5-flash-latest";
const systemInstruction = `
Act as an SVG code generator.
Strict rules:
1. Root <svg> MUST have: xmlns='http://www.w3.org/2000/svg' and viewBox='0 0 24 24'.
2. Default style for elements: fill='currentColor', stroke-width='1'. Apply unless prompt specifies otherwise.
3. Design: Complex and iconic but visually clear. Define and separate shapes effectively using thin strokes or white spaces.
4. Output ONLY raw SVG code, starting with <svg> and ending with </svg>. Keep the svg code simple but efficient.
5. NO other text, explanations, or comments outside the code block.
`;
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
const generationConfig = {
  temperature: 0.4,
  topK: 32,
  topP: 1,
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

      try {
        const model = geminiClient.getGenerativeModel({
          model: env.GOOGLE_GEMINI_MODEL ?? defaultModel,
          systemInstruction: { role: "system", parts: [{ text: systemInstruction }] },
          generationConfig,
          safetySettings
        });

        const result = await model.generateContent(prompt);
        const response = result.response;

        const candidate = response?.candidates?.[0];
        if (!candidate) {
          console.error("Gemini Error: No candidates found in response.", response);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR", // Or UNPROCESSABLE_CONTENT
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

        console.log("Raw SVG received from Gemini:", rawSvg.substring(0, 100) + "..."); // Log snippet

        let sanitizedSvg: string | null = null;
        try {
          sanitizedSvg = await extractAndSanitizeSvg(rawSvg);
        } catch (sanitizeError) {
          console.error("SVG Sanitization Error:", sanitizeError);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process the generated SVG.",
            cause: sanitizeError
          });
        }

        if (!sanitizedSvg || sanitizedSvg.trim().length === 0) {
          console.error("SVG Sanitization Resulted in Empty Output. Raw SVG:", rawSvg);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Generated SVG was invalid or could not be sanitized."
          });
        }

        return sanitizedSvg;
      } catch (error: unknown) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error during SVG generation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while generating the SVG.",
          cause: error
        });
      }
    })
});
