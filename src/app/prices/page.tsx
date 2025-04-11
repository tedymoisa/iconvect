import { type Metadata } from "next";
import PriceCards from "./price-cards";
import { api } from "@/trpc/server";

export const metadata: Metadata = {
  title: "Pricing | SVG AI Generator",
  description: "Choose the perfect credit package for your AI-generated SVG needs"
};

export default async function PricesPage() {
  const prices = await api.stripe.prices();

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mb-24 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground dark:text-foreground_dark md:text-5xl">
            Choose Your <span className="text-primary">Credit Package</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-foreground-muted dark:text-foreground-muted_dark">
            Unlock the power of AI-generated SVGs with our flexible credit packages
          </p>
        </div>

        <PriceCards prices={prices} />

        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-foreground dark:text-foreground_dark">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="border-b border-border pb-6 dark:border-border_dark">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground_dark">How do credits work?</h3>
              <p className="mt-2 text-foreground-muted dark:text-foreground-muted_dark">
                Each AI SVG generation costs a certain number of credits depending on complexity. Most standard
                generations cost 1 credit.
              </p>
            </div>
            <div className="border-b border-border pb-6 dark:border-border_dark">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground_dark">Do credits expire?</h3>
              <p className="mt-2 text-foreground-muted dark:text-foreground-muted_dark">
                No, your purchased credits never expire. Use them whenever you need them.
              </p>
            </div>
            <div className="border-b border-border pb-6 dark:border-border_dark">
              <h3 className="text-lg font-medium text-foreground dark:text-foreground_dark">Can I get a refund?</h3>
              <p className="mt-2 text-foreground-muted dark:text-foreground-muted_dark">
                We offer refunds within 7 days of purchase if you haven`&apos;t used any credits from your package.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
