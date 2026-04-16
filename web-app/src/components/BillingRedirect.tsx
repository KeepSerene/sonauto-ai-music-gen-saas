"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

export default function BillingRedirect() {
  const router = useRouter();
  const hasFired = useRef(false); // Prevents double-firing in React Strict Mode

  useEffect(() => {
    if (hasFired.current) return;

    hasFired.current = true;

    const redirectToPortal = async () => {
      try {
        const res = await authClient.customer.portal();

        // If the method returns an error object without throwing, catch it here
        if (res?.error) {
          throw new Error(res.error.message || "Failed to load portal");
        }
      } catch (error) {
        console.error("Customer Portal Error:", error);
        toast.error("Could not load your billing portal! Please try again.");
        router.push("/dashboard"); // Kick them back to safety
      }
    };

    void redirectToPortal();
  }, [router]);

  return (
    <section className="animate-in fade-in flex flex-col items-center justify-center gap-4 text-center duration-500">
      <div className="bg-primary/10 flex size-16 items-center justify-center rounded-full">
        <Loader2 className="text-primary size-8 animate-spin" />
      </div>

      <div className="space-y-1">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Opening Billing Portal
        </h1>

        <p className="text-muted-foreground max-w-sm text-sm">
          You are being securely redirected to our billing provider to manage
          your account and view receipts.
        </p>
      </div>
    </section>
  );
}
