"use client";

import type Stripe from "stripe";
import axios from "axios";
import { apiUrl } from "@/lib/constants";
import { type StripePaymentIntent } from "../api/stripe/payment/route";

export default function PurchaseNowButton({ price }: { price: Stripe.Price }) {
  const product = price.product as Stripe.Product;
  const isPopular = product.metadata.popular === "true";

  const handlePurchase = async () => {
    const response = axios.post<StripePaymentIntent>(`${apiUrl}/api/stripe/payment`, { priceId: price.id });

    console.log(response);
  };

  return (
    <button
      onClick={handlePurchase}
      className={`w-full rounded-md px-4 py-2 font-medium transition-colors ${
        isPopular
          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
          : "text-foreground dark:text-foreground_dark bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
      }`}
    >
      Purchase Now
    </button>
  );
}
