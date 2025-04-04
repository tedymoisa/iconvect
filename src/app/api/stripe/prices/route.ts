import { getStripePrices } from "@/api/prices";
import { type ApiResponse } from "@/lib/types/api-response";
import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const authSession = await auth();
  if (!authSession) return NextResponse.json<ApiResponse<string>>({ result: "Not authenticated" }, { status: 401 });

  try {
    const prices = await getStripePrices();

    return NextResponse.json<ApiResponse<Stripe.Price[]>>({ result: prices }, { status: 200 });
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json<ApiResponse<string>>({ result: error.message }, { status: error.statusCode ?? 500 });
    }

    return NextResponse.json<ApiResponse<string>>({ result: "Internal Server Error" }, { status: 500 });
  }
}
