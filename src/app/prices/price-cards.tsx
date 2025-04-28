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

        const featuresString = product.metadata.features ?? "SVG generation,24/7 support";
        const features = featuresString.split(",");

        return (
          <div
            key={price.id}
            className={`relative w-full overflow-hidden rounded-lg md:w-auto ${
              isPopular
                ? "ring-primary z-10 ring-2 md:-mt-4 md:mb-4 md:scale-110"
                : "dark:ring-border_dark ring-border ring-1"
            }`}
          >
            {isPopular && (
              <div className="bg-primary text-primary-foreground py-1.5 text-center text-sm font-medium">
                Most Popular
              </div>
            )}

            <div className="dark:bg-background_dark bg-background p-6">
              <div className="mb-8">
                <h3 className="dark:text-foreground_dark text-foreground mb-2 text-xl font-bold">{product.name}</h3>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="dark:text-foreground_dark text-foreground text-4xl font-bold">€{amount}</span>
                  <span className="text-foreground-muted dark:text-foreground-muted_dark ml-2">one-time</span>
                </div>
                <div className="mt-4">
                  <span className="text-primary text-lg font-medium">{credits} Credits</span>
                </div>
              </div>

              <div className="mb-8 space-y-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <CheckIcon className="text-primary mt-0.5 mr-2 h-5 w-5 shrink-0" />
                    <span className="dark:text-foreground_dark text-foreground">{feature.trim()}</span>
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
