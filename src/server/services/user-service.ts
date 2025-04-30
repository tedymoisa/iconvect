import { tryCatch } from "@/lib/try-catch";
import { CreditTransactionType, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const userService = {
  checkSufficientCredits: async (db: PrismaClient, userId: string, requiredCredits: number): Promise<void> => {
    if (requiredCredits <= 0) return; // No check needed for zero/negative cost

    const { data: user, error } = await tryCatch(
      db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
      })
    );

    if (error) {
      console.error(`Database error during credit check for user ${userId}:`, error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check user credits due to a database error.",
        cause: error
      });
    }

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found."
      });
    }

    if (user.credits < requiredCredits) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Insufficient credits. Requires ${requiredCredits}, you have ${user.credits}.`
      });
    }

    console.log(`User ${userId} credit check passed. Has ${user.credits}, requires ${requiredCredits}.`);
  },

  deductCredits: async (db: PrismaClient, userId: string, cost: number): Promise<void> => {
    const description = "Credit deduction for AI generation";

    const { error } = await tryCatch(
      db.$transaction(async (tx) => {
        // 1. Find user and check credits within the transaction
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { credits: true }
        });

        if (!user) {
          throw new Error("User not found during credit deduction.");
        }

        // 2. Verify sufficient credits within the transaction
        if (user.credits < cost) {
          console.warn(
            `User ${userId} credits became insufficient (${user.credits}) before deduction (${cost}) could complete.`
          );
          throw new Error(`Insufficient credits. ${cost} required.`);
        }

        // 3. Deduct credits
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: {
              decrement: cost
            }
          },
          select: { credits: true }
        });

        // 4. Log the credit transaction
        await tx.creditTransaction.create({
          data: {
            userId: userId,
            amount: -cost,
            type: CreditTransactionType.GENERATION,
            description: description
          }
        });
      })
    );

    if (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error(`Database error during credit deduction for user ${userId}:`, error);
      throw new Error("Failed to deduct credits due to a database error.");
    }

    console.log(`Successfully deducted ${cost} credits from user ${userId}.`);
  }
};
