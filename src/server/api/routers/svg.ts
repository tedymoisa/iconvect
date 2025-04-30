import { env } from "@/env";
import { ICONVECT_AI_GENERATORS, ICONVECT_AI_MODELS, MOCK_SVG } from "@/lib/constants";
import { tryCatch } from "@/lib/try-catch";
import { svgService } from "@/server/services/svg-service";
import { userService } from "@/server/services/user-service";
import { AiGenerationStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const aiModelOptionSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.nativeEnum(ICONVECT_AI_MODELS),
  generator: z.nativeEnum(ICONVECT_AI_GENERATORS),
  cost: z.number()
});

export const svgRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1, "Prompt cannot be empty").max(255, "Prompt is too long"),
        model: aiModelOptionSchema
      })
    )
    .output(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      console.log(`User ${userId} generating SVG with prompt: "${input.prompt}"`);

      // 1. Initiate AI Request
      const { data: aiGenerationRequest, error: createGenerationRequestError } = await tryCatch(
        ctx.db.aiGenerationRequest.create({
          data: {
            userId: userId,
            prompt: input.prompt,
            creditsCost: input.model.cost,
            status: AiGenerationStatus.PENDING
          }
        })
      );
      if (createGenerationRequestError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG.",
          cause: createGenerationRequestError
        });
      }

      // 2. Run generator
      let svg;
      if (env.NODE_ENV === "development") {
        svg = MOCK_SVG;
      } else {
        switch (input.model.generator) {
          case ICONVECT_AI_GENERATORS.GEMINI:
            const { data: geminiSvg, error: geminiError } = await tryCatch(
              svgService.geminiSvg(input.model.model, input.prompt)
            );
            if (geminiError) {
              const { error } = await tryCatch(
                ctx.db.aiGenerationRequest.update({
                  where: { id: aiGenerationRequest.id },
                  data: {
                    status: AiGenerationStatus.FAILED,
                    errorMessage: "Failed to get response from AI model."
                  }
                })
              );
              if (error) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to generate SVG.",
                  cause: geminiError
                });
              }

              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to generate SVG.",
                cause: geminiError
              });
            }

            svg = geminiSvg;
            break;

          case ICONVECT_AI_GENERATORS.OPENAI:
            const { data: openaiSvg, error: openaiError } = await tryCatch(
              svgService.openaiSvg(input.model.model, input.prompt)
            );
            if (openaiError) {
              const { error } = await tryCatch(
                ctx.db.aiGenerationRequest.update({
                  where: { id: aiGenerationRequest.id },
                  data: {
                    status: AiGenerationStatus.FAILED,
                    errorMessage: "Failed to get response from AI model."
                  }
                })
              );
              if (error) {
                throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Failed to generate SVG.",
                  cause: openaiError
                });
              }

              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to generate SVG.",
                cause: openaiError
              });
            }

            svg = openaiSvg;
            break;

          default:
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to generate SVG."
            });
        }
      }

      // 3. Update Ai Generation Request
      const { error: updateGenerationRequestError } = await tryCatch(
        ctx.db.aiGenerationRequest.update({
          where: { id: aiGenerationRequest.id },
          data: {
            status: AiGenerationStatus.COMPLETED,
            completedAt: new Date()
          }
        })
      );
      if (updateGenerationRequestError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG.",
          cause: updateGenerationRequestError
        });
      }

      // 4. Deduct credits
      const { error: deductCreditsError } = await tryCatch(userService.deductCredits(ctx.db, userId, input.model.cost));
      if (deductCreditsError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate SVG.",
          cause: deductCreditsError
        });
      }

      return svg;
    })
});
