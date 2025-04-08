import { type ApiResponse } from "@/lib/types/api-response";
import { db } from "@/server/db";
import { stripeClient } from "@/server/stripe";
import { CreditTransactionType, OrderStatus, UserStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(await req.text(), sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return NextResponse.json<ApiResponse<string>>({ result: "Webhook Error." }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await checkoutSessionCompleted(event);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json<ApiResponse<string>>({ result: "Stripe event received." }, { status: 200 });
}

async function checkoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  console.log(`🛒 CheckoutSession successful: ${session.id}`);

  if (session.payment_status === "paid") {
    const userId = session.metadata?.userId;
    const credits = session.metadata?.credits;

    if (!userId || !credits) {
      console.error(`❌ Metadata missing from CheckoutSession: ${session.id}`);
      return NextResponse.json<ApiResponse<string>>({ result: "Metadata missing." }, { status: 200 });
    }

    const numberOfCredits = parseInt(credits, 10);
    if (isNaN(numberOfCredits) || numberOfCredits <= 0) {
      console.error(`❌ Invalid credits in metadata: ${credits} for Session: ${session.id}`);
      return NextResponse.json<ApiResponse<string>>({ result: "Invalid metadata." }, { status: 200 });
    }

    const existingOrder = await db.order.findUnique({
      where: { providerOrderId: session.id }
    });
    if (existingOrder && existingOrder.status === OrderStatus.COMPLETED) {
      console.log(`🔁 Order ${existingOrder.id} already processed for Session ${session.id}. Skipping.`);
      return NextResponse.json<ApiResponse<string>>({ result: "Already processed." }, { status: 200 });
    }

    try {
      const amountDecimal = new Decimal((session.amount_total ?? 0) / 100);

      await db.$transaction(async (tx) => {
        // Create/Update Order
        const order = await tx.order.upsert({
          where: { providerOrderId: session.id },
          update: {
            status: OrderStatus.COMPLETED,
            amount: amountDecimal,
            currency: session.currency?.toUpperCase() ?? "EUR",
            updatedAt: new Date()
          },
          create: {
            userId: userId,
            status: OrderStatus.COMPLETED,
            amount: amountDecimal,
            currency: session.currency?.toUpperCase() ?? "EUR",
            creditsPurchased: numberOfCredits,
            paymentProvider: "STRIPE",
            providerOrderId: session.id
          }
        });

        // Create Credit Transaction
        await tx.creditTransaction.create({
          data: {
            userId: userId,
            amount: numberOfCredits,
            type: CreditTransactionType.PURCHASE,
            description: `Purchase via Stripe Checkout: ${session.id}`,
            orderId: order.id
          }
        });

        // Update User Credits
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: { increment: numberOfCredits },
            status: UserStatus.SUBSCRIBED
          }
        });

        // Create Invoice
        await tx.invoice.create({
          data: {
            orderId: order.id,
            userId: userId,
            providerInvoiceId: session.invoice
              ? typeof session.invoice === "string"
                ? session.invoice
                : session.invoice.id
              : null,
            status: "paid",
            amountPaid: amountDecimal,
            currency: session.currency?.toUpperCase() ?? "EUR",
            paidAt: session.created ? new Date(session.created * 1000) : new Date()
          }
        });

        console.log(
          `✅ Successfully processed Session ${session.id}. User ${userId} granted ${numberOfCredits} credits. Order ${order.id} created.`
        );
      });
    } catch (error) {
      console.error(`🚨 Database update failed for Session ${session.id}:`, error);
      return NextResponse.json<ApiResponse<string>>({ result: "Database update failed." }, { status: 500 });
    }
  } else {
    console.log(
      `ℹ️ CheckoutSession ${session.id} completed but payment status is ${session.payment_status}. No action taken.`
    );
  }
}
