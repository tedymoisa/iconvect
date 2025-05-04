import { env } from "@/env";
import { tryCatch, tryCatchSync } from "@/lib/try-catch";
import { type ApiResponse } from "@/lib/types/api-response";
import { db } from "@/server/db";
import { stripeClient } from "@/server/stripe";
import { CreditTransactionType, OrderStatus, Prisma, UserStatus } from "@prisma/client";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const { data: event, error } = tryCatchSync(() =>
    stripeClient.webhooks.constructEvent(body, signature!, env.STRIPE_WEBHOOK_SECRET)
  );
  if (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
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

    const { data: existingOrder, error: findOrderError } = await tryCatch(
      db.order.findUnique({
        where: { providerOrderId: session.id }
      })
    );
    if (findOrderError) {
      console.error(`🚨 Failed to check existing order for Session ${session.id}:`, findOrderError);
      return NextResponse.json<ApiResponse<string>>({ result: "Database error." }, { status: 500 });
    }

    if (existingOrder && existingOrder.status === OrderStatus.COMPLETED) {
      console.log(`🔁 Order ${existingOrder.id} already processed for Session ${session.id}. Skipping.`);
      return NextResponse.json<ApiResponse<string>>({ result: "Already processed." }, { status: 200 });
    }

    const amountDecimal = new Prisma.Decimal((session.amount_total ?? 0) / 100);

    const { error: transactionError } = await tryCatch(
      db.$transaction(async (tx) => {
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
            amount: new Prisma.Decimal(numberOfCredits),
            type: CreditTransactionType.PURCHASE,
            description: `Purchase via Stripe Checkout: ${session.id}`,
            orderId: order.id
          }
        });

        // Update User Credits
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: { increment: new Prisma.Decimal(numberOfCredits) },
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
      })
    );

    if (transactionError) {
      console.error(`🚨 Database update failed for Session ${session.id}:`, transactionError);
      return NextResponse.json<ApiResponse<string>>({ result: "Database update failed." }, { status: 500 });
    }
  } else {
    console.log(
      `ℹ️ CheckoutSession ${session.id} completed but payment status is ${session.payment_status}. No action taken.`
    );
  }
}
