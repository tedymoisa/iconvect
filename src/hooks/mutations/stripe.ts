import { type StripePaymentIntent, type StripeSessionId } from "@/app/api/stripe/payment/route";
import { apiUrl } from "@/lib/constants";
import { type ApiResponse } from "@/lib/types/api-response";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";

export function useCheckoutSession() {
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

  return useMutation({
    mutationFn: async (priceId: string) => {
      const { data: stripeSession } = await axios.post<
        StripePaymentIntent,
        AxiosResponse<ApiResponse<StripeSessionId>>
      >(`${apiUrl}/api/stripe/payment`, { priceId: priceId });

      const stripe = await stripePromise;

      return await stripe!.redirectToCheckout({
        sessionId: stripeSession.result.id
      });
    }
  });
}
