import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { type ApiResponse } from "@/lib/types/api-response";
import { formatZodError, readBody, validate } from "@/lib/utils";
import { z } from "zod";
import { stripeClient } from "@/server/stripe";
import Stripe from "stripe";
import { apiUrl } from "@/lib/constants";

const stripePaymentIntentSchema = z.object({
  priceId: z.string()
});
export type StripePaymentIntent = z.infer<typeof stripePaymentIntentSchema>;
export type StripeSessionId = Pick<Stripe.Response<Stripe.Checkout.Session>, "id">;

export async function POST(req: NextRequest) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json<ApiResponse<string>>({ result: "Not authenticated" }, { status: 401 });

  const userId = authSession.user.id;

  try {
    const body = await readBody<StripePaymentIntent>(req);
    const { error, data } = validate(body, stripePaymentIntentSchema);
    if (error) {
      return NextResponse.json<ApiResponse<string>>(
        {
          result: "Validation error",
          errors: formatZodError(error)
        },
        { status: 400 }
      );
    }

    const price = await stripeClient.prices.retrieve(data.priceId, { expand: ["product"] });
    if (!price || !price.active || price.type !== "one_time") {
      return NextResponse.json<ApiResponse<string>>({ result: "Invalid or inactive price." }, { status: 400 });
    }

    const amountInCents = price.unit_amount;
    const currency = price.currency;
    const product = price.product as Stripe.Product;
    const credits = product.metadata.credits;

    if (!amountInCents || !credits) {
      return NextResponse.json<ApiResponse<string>>({ result: "Price configuration error." }, { status: 400 });
    }

    // const successUrl = `${apiUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const successUrl = `${apiUrl}`;
    const cancelUrl = `${apiUrl}/payment-cancelled`;
    const checkoutSession = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card", "paypal"],
      mode: "payment",
      line_items: [
        {
          price: data.priceId,
          quantity: 1
        }
      ],
      currency: currency,
      metadata: {
        userId: userId,
        userEmail: authSession.user.email ?? "",
        priceId: data.priceId,
        credits: credits
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: authSession.user.email ?? undefined
    });

    return NextResponse.json<ApiResponse<StripeSessionId>>({ result: { id: checkoutSession.id } }, { status: 200 });
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json<ApiResponse<string>>({ result: error.message }, { status: error.statusCode ?? 500 });
    }

    return NextResponse.json<ApiResponse<string>>({ result: "Internal Server Error" }, { status: 500 });
  }
}
