import { CheckIcon } from "lucide-react";
import { useMemo } from "react";
import type Stripe from "stripe";
import PurchaseNowButton from "./purchase-now-button";

export default function PriceCards({ prices }: { prices: Stripe.Price[] }) {
  const sortedPrices = useMemo(() => {
    return prices.sort((a, b) => {
      const aAmount = a.unit_amount ?? 0;
      const bAmount = b.unit_amount ?? 0;

      return aAmount - bAmount;
    });
  }, [prices]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-12 md:flex-row md:items-stretch">
      {sortedPrices.map((price) => {
        const product = price.product as Stripe.Product;
        const isPopular = product.metadata.popular === "true";
        const credits = Number.parseInt(product.metadata?.credits ?? "0");
        const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : "0.00";

        const featuresString =
          product.metadata.features ?? "Full SVG editing capabilities,Download in SVG format,24/7 support";
        const features = featuresString.split(",");

        return (
          <div
            key={price.id}
            className={`relative w-full overflow-hidden rounded-lg md:w-auto ${
              isPopular
                ? "ring-primary z-10 ring-2 md:-mt-4 md:mb-4 md:scale-110"
                : "ring-border dark:ring-border_dark ring-1"
            }`}
          >
            {isPopular && (
              <div className="bg-primary text-primary-foreground py-1.5 text-center text-sm font-medium">
                Most Popular
              </div>
            )}

            <div className="bg-background dark:bg-background_dark p-6">
              <div className="mb-8">
                <h3 className="text-foreground dark:text-foreground_dark mb-2 text-xl font-bold">{product.name}</h3>
                <p className="text-foreground-muted dark:text-foreground-muted_dark">{product.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-foreground dark:text-foreground_dark text-4xl font-bold">€{amount}</span>
                  <span className="text-foreground-muted dark:text-foreground-muted_dark ml-2">one-time</span>
                </div>
                <div className="mt-4">
                  <span className="text-primary text-lg font-medium">{credits} Credits</span>
                </div>
              </div>

              <div className="mb-8 space-y-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <CheckIcon className="text-primary mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
                    <span className="text-foreground dark:text-foreground_dark">{feature.trim()}</span>
                  </div>
                ))}
              </div>

              <PurchaseNowButton price={price} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
