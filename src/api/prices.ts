import { stripeClient } from "@/server/stripe";
import type Stripe from "stripe";

export async function getStripePrices() {
  const prices = await stripeClient.prices.list({
    active: true,
    type: "one_time",
    currency: "eur",
    expand: ["data.product"]
  });

  const validPrices = prices.data.filter((price) => {
    const product = price.product as Stripe.Product;

    return product.metadata.credits && typeof price.product === "object";
  });

  return validPrices;
}
