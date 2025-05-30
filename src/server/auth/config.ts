import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { type Adapter } from "next-auth/adapters";
import GitHub from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { db } from "@/server/db";
import { CreditTransactionType, Prisma, type UserStatus } from "@prisma/client";
import { env } from "@/env";
import { type Decimal } from "@prisma/client/runtime/library";
import { logger } from "@/lib/logger";
import { tryCatch } from "@/lib/try-catch";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: Decimal;
      status: UserStatus;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    credits: Decimal;
    status: UserStatus;
    // ...other properties
    // role: UserRole;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    GitHub({
      clientId: env.AUTH_GITHUB_ID,
      clientSecret: env.AUTH_GITHUB_SECRET
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  // eslint-disable-next-line
  adapter: PrismaAdapter(db) as Adapter,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        credits: user.credits,
        status: user.status
      }
    })
  },
  events: {
    createUser: async (message) => {
      logger.info("✨ New user created:", message.user.id, message.user.email);

      const userId = message.user.id;
      const initialCredits = new Prisma.Decimal(15);

      if (userId) {
        const { error } = await tryCatch(
          db.creditTransaction.create({
            data: {
              userId: userId,
              amount: initialCredits,
              type: CreditTransactionType.TRIAL_GRANT,
              description: "Initial trial credits granted upon sign-up."
            }
          })
        );

        if (error) {
          logger.error("❌ Error performing actions during createUser event:", error);
        }

        logger.info(`✅ Logged initial ${String(initialCredits)} trial credits for user ${userId}`);
      }
    }
  }
} satisfies NextAuthConfig;
