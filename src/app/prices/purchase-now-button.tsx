"use client";

import Loader from "@/components/loader";
import { useCheckoutSession } from "@/hooks/mutations/stripe";
import type Stripe from "stripe";

export default function PurchaseNowButton({ price }: { price: Stripe.Price }) {
  const product = price.product as Stripe.Product;
  const isPopular = product.metadata.popular === "true";

  const { mutate, isPending } = useCheckoutSession();

  const handlePurchase = () => {
    mutate(price.id);
  };

  return (
    <button
      onClick={handlePurchase}
      className={`flex w-full justify-center rounded-md px-4 py-2 font-medium transition-colors ${
        isPopular
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-slate-100 text-foreground hover:bg-slate-200 dark:bg-slate-800 dark:text-foreground_dark dark:hover:bg-slate-700"
      }`}
    >
      {isPending ? <Loader /> : "Purchase Now"}
    </button>
  );
}
