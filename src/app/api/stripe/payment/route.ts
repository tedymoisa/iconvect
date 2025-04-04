import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ApiResponse } from "@/lib/types/api-response";
import { formatZodError, readBody, validate } from "@/lib/utils";
import { z } from "zod";
import { stripeClient } from "@/server/stripe";
import Stripe from "stripe";

const stripePaymentIntentSchema = z.object({
  priceId: z.string()
});
export type StripePaymentIntent = z.infer<typeof stripePaymentIntentSchema>;

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

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      metadata: {
        userId: userId,
        userEmail: authSession.user.email ?? "",
        priceId: data.priceId,
        credits: credits
      },
      automatic_payment_methods: { enabled: true }
    });

    return NextResponse.json<ApiResponse<{ clientSecret: string }>>(
      { result: { clientSecret: paymentIntent.client_secret! } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating Payment Intent:", error);
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json<ApiResponse<string>>({ result: error.message }, { status: error.statusCode ?? 500 });
    }

    return NextResponse.json<ApiResponse<string>>({ result: "Internal Server Error" }, { status: 500 });
  }
}
