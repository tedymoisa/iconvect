import { stripeClient } from "@/server/stripe";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { apiUrl } from "@/lib/constants";

export const stripeRouter = createTRPCRouter({
  prices: publicProcedure.output(z.array(z.custom<Stripe.Price>())).query(async () => {
    try {
      const prices = await stripeClient.prices.list({
        active: true,
        type: "one_time",
        currency: "eur",
        expand: ["data.product"]
      });

      const validPrices = prices.data.filter((price) => {
        const product = price.product as Stripe.Product;

        return product.metadata.credits && typeof price.product === "object";
      });

      return validPrices;
    } catch (error: unknown) {
      if (error instanceof Stripe.errors.StripeError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Stripe Error: ${error.message}`,
          cause: error
        });
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while fetching prices.",
        cause: error
      });
    }
  }),

  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string()
      })
    )
    .output(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userEmail = ctx.session.user.email;
      const { priceId } = input;

      try {
        const price = await stripeClient.prices.retrieve(priceId, {
          expand: ["product"]
        });

        if (!price || !price.active || price.type !== "one_time") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or inactive price selected."
          });
        }

        if (typeof price.product !== "object" || price.product === null || price.product.deleted) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Product details not found for the selected price."
          });
        }
        const product = price.product;

        const amountInCents = price.unit_amount;
        const currency = price.currency;
        const credits = product.metadata.credits;

        if (!amountInCents || !credits) {
          console.error("Price configuration error for priceId:", priceId, price);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Price configuration error. Please contact support."
          });
        }

        const successUrl = `${apiUrl}`;
        const cancelUrl = `${apiUrl}`;

        const checkoutSession = await stripeClient.checkout.sessions.create({
          payment_method_types: ["card", "paypal"],
          mode: "payment",
          line_items: [
            {
              price: priceId,
              quantity: 1
            }
          ],
          currency: currency,
          metadata: {
            userId: userId,
            userEmail: userEmail ?? "",
            priceId: priceId,
            credits: credits
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: userEmail ?? undefined
        });

        if (!checkoutSession.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not retrieve session ID after creation."
          });
        }

        return { id: checkoutSession.id };
      } catch (error: unknown) {
        console.error("Error creating Stripe Checkout Session:", error);

        if (error instanceof Stripe.errors.StripeError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Stripe Error: ${error.message}`,
            cause: error
          });
        }

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create payment session.",
          cause: error
        });
      }
    })
});
