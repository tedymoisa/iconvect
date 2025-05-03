import { tryCatch } from "@/lib/try-catch";
import { CreditTransactionType, type PrismaClient } from "@prisma/client";
import { type Decimal } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";

export const userService = {
  deductCredits: async (db: PrismaClient, userId: string, cost: Decimal): Promise<void> => {
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
            `User ${userId} credits became insufficient (${String(user.credits)}) before deduction (${String(cost)}) could complete.`
          );
          throw new Error(`Insufficient credits. ${String(cost)} required.`);
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
            amount: cost,
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

    console.log(`Successfully deducted ${String(cost)} credits from user ${userId}.`);
  }
};
