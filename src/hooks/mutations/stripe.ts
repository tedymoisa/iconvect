import { env } from "@/env";
import { api } from "@/trpc/react";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";

export function useCheckoutSession() {
  const { mutateAsync } = api.stripe.createCheckoutSession.useMutation();
  const stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return useMutation({
    mutationFn: async ({ priceId }: { priceId: string }) => {
      const { id } = await mutateAsync({ priceId: priceId });

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }

      return await stripe.redirectToCheckout({
        sessionId: id
      });
    }
  });
}
