import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { openaiClient } from "@/server/openai";
import { env } from "@/env";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";
import { svgService } from "@/server/services/svg-service";
import { tryCatch } from "@/lib/try-catch";

const defaultModel = "gpt-4o-mini";
const systemPrompt =
  "You are an SVG generator for web apps. Output SVGs with viewBox='0 0 24 24', stroke='currentColor', fill='none', and stroke-width='1.5'. Optimize for web development and ensure compatibility (always add xmlns='http://www.w3.org/2000/svg'). Respond with only the raw SVG code (starting with <svg> and ending with </svg>) and absolutely no other text or explanations. Do not use markdown code fences.";

export const openaiRouter = createTRPCRouter({
  generateSvgOpenAi: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt cannot be empty").max(255, "Prompt is too long")
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { prompt } = input;

      console.log(`User ${userId} generating SVG with OpenAI prompt: "${prompt}"`);

      // 1. OpenAI completion
      const { data: completion, error: openAiError } = await tryCatch(
        openaiClient.chat.completions.create({
          model: env.OPENAI_MODEL ?? defaultModel,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        })
      );

      if (openAiError) {
        if (openAiError instanceof OpenAI.APIError) {
          console.error("OpenAI API Error:", openAiError.status, openAiError.name, openAiError.message);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to communicate with AI service: ${openAiError.message}`,
            cause: openAiError
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG: Error from AI model.",
          cause: openAiError
        });
      }

      const choice = completion.choices?.[0];
      const rawSvgContent = choice?.message?.content;

      if (!rawSvgContent || rawSvgContent.trim().length === 0) {
        console.error("OpenAI Error: No content found in response.", completion);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG: Empty response from AI model."
        });
      }

      console.log("Raw content received from OpenAI:", rawSvgContent.substring(0, 100) + "...");

      // 2. Sanitize SVG
      const { data: sanitizedSvg, error: sanitizeError } = await tryCatch(svgService.sanitizeSvg(rawSvgContent));

      if (sanitizeError) {
        console.error("SVG Extraction/Sanitization Error:", sanitizeError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process the generated SVG.",
          cause: sanitizeError
        });
      }

      if (!sanitizedSvg || sanitizedSvg.trim().length === 0) {
        console.error("SVG Sanitization Resulted in Empty Output. Raw Content:", rawSvgContent);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Generated SVG was invalid or could not be processed."
        });
      }

      return sanitizedSvg;
    })
});
