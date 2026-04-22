"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { authClient } from "~/server/better-auth/client";

interface PricingCTAButtonProps {
  label: string;
  productId: string | null; // null = Free plan
  highlighted: boolean;
  isAuthenticated: boolean;
}

export default function PricingCTAButton({
  label,
  productId,
  highlighted,
  isAuthenticated,
}: PricingCTAButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    // ── Free plan ────────────────────────────────────────────────────────
    if (!productId) {
      router.push(isAuthenticated ? "/dashboard" : "/auth/sign-up");
      return;
    }

    // ── Paid plan, not logged in ─────────────────────────────────────────
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
      return;
    }

    // ── Paid plan, logged in -> open Polar checkout for this pack only ────
    try {
      await authClient.checkout({ products: [productId] });
    } catch (err) {
      console.error("Checkout failed:", err);
      toast.error("Couldn't open checkout. Please try again.");
    }
  };

  return (
    <Button
      type="button"
      variant={highlighted ? "default" : "outline"}
      size="sm"
      className="w-full"
      onClick={handleClick}
    >
      {label}
    </Button>
  );
}
