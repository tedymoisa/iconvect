import { apiUrl } from "@/lib/constants";
import { stripeClient } from "@/server/stripe";
import { TRPCError } from "@trpc/server";
import Stripe from "stripe";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { tryCatch } from "@/lib/try-catch";
import { cache } from "react";

export const stripeRouter = createTRPCRouter({
  prices: publicProcedure.output(z.array(z.custom<Stripe.Price>())).query(async () => {
    const fetchPricesCached = cache(async () => {
      const { data: prices, error } = await tryCatch(
        stripeClient.prices.list({
          active: true,
          type: "one_time",
          currency: "eur",
          expand: ["data.product"]
        })
      );

      if (error) {
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

      return prices;
    });

    const { data: cachedPrices, error } = await tryCatch(fetchPricesCached());
    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred while caching prices.",
        cause: error
      });
    }

    const validPrices = cachedPrices.data.filter((price) => {
      const product = price.product as Stripe.Product;
      return product.metadata.credits && typeof price.product === "object";
    });

    return validPrices;
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

      // 1. Retrieve price
      const { data: price, error: priceError } = await tryCatch(
        stripeClient.prices.retrieve(priceId, { expand: ["product"] })
      );
      if (priceError) {
        console.error("Stripe error retrieving price:", priceError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve price from Stripe.",
          cause: priceError
        });
      }

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

      // 2. Create checkout session
      const { data: checkoutSession, error: sessionError } = await tryCatch(
        stripeClient.checkout.sessions.create({
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
        })
      );
      if (sessionError) {
        console.error("Stripe error creating checkout session:", sessionError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create Stripe checkout session.",
          cause: sessionError
        });
      }

      if (!checkoutSession.id) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not retrieve session ID after creation."
        });
      }

      return { id: checkoutSession.id };
    })
});
