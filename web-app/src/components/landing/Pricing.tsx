import { Check } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  HOME_PRICING_PLANS,
  POLAR_STARTER_PACK_ID,
  POLAR_PRODUCER_PACK_ID,
  POLAR_STUDIO_PACK_ID,
} from "~/lib/constants";
import { Badge } from "../ui/badge";
import PricingCTAButton from "./PricingCTAButton";

const PLAN_PRODUCT_IDS: Record<string, string | null> = {
  Free: null,
  Starter: POLAR_STARTER_PACK_ID,
  Producer: POLAR_PRODUCER_PACK_ID,
  Studio: POLAR_STUDIO_PACK_ID,
};

interface PricingProps {
  isAuthenticated: boolean;
}

const Pricing = ({ isAuthenticated }: PricingProps) => (
  <section
    id="pricing"
    className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
  >
    {/* Section header */}
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
        Simple, credit-based pricing
      </h2>

      <p className="text-muted-foreground mt-4 text-base">
        Each generation costs 2 credits. Buy what you need — no recurring
        charges.
      </p>
    </div>

    {/* Pricing grid */}
    <div className="mx-auto mt-14 max-w-5xl">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {HOME_PRICING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-xl border p-6 transition-shadow duration-200",
              plan.highlighted
                ? "border-primary/50 bg-primary/5 shadow-md hover:shadow-lg"
                : "border-border/60 bg-card/60 hover:bg-card backdrop-blur-sm",
            )}
          >
            {/* Popular badge */}
            {plan.badge && (
              <Badge
                variant="default"
                className="absolute -top-3 left-1/2 -translate-x-1/2"
              >
                {plan.badge}
              </Badge>
            )}

            {/* Plan header */}
            <div className="mb-5">
              <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                {plan.tagline}
              </p>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-foreground text-3xl font-bold tracking-tight">
                  {plan.price}
                </span>

                {plan.period && (
                  <span className="text-muted-foreground text-xs">
                    {plan.period}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mt-2 text-sm">
                <span className="text-foreground font-semibold">
                  {plan.credits}
                </span>{" "}
                credits ·{" "}
                <span className="text-foreground font-semibold">
                  ~{plan.songs}
                </span>{" "}
                songs
              </p>
            </div>

            {/* CTA */}
            <PricingCTAButton
              label={plan.cta}
              productId={PLAN_PRODUCT_IDS[plan.name] ?? null}
              highlighted={plan.highlighted}
              isAuthenticated={isAuthenticated}
            />

            {/* Perks */}
            <ul className="mt-6 flex flex-col gap-2.5">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5">
                  <Check
                    className="text-primary mt-0.5 size-3.5 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="text-muted-foreground text-xs leading-snug">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-muted-foreground/70 mt-8 text-center text-xs">
        Credits never expire. You can purchase multiple packs anytime.
      </p>
    </div>
  </section>
);

export default Pricing;
