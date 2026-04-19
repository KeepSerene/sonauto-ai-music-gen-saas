"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient } from "~/server/better-auth/client";
import Logo from "~/components/Logo";

export default function SignOutClient() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              // Full reload to flush Next.js router cache entirely
              window.location.href = "/auth/sign-in";
            },
          },
        });
      } catch (error) {
        console.error("Failed to sign out:", error);
        toast.error("Sign-out failed. Redirecting back...");
        router.replace("/dashboard");
      }
    };

    void performSignOut();
  }, [router]);

  return (
    <div className="relative flex w-full flex-col items-center justify-center">
      {/* Subtle background glow */}
      <div className="bg-primary/30 absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]" />

      {/* Glassmorphism Card */}
      <div className="border-border/50 bg-card/40 relative flex w-full flex-col items-center justify-center space-y-8 rounded-2xl border p-12 text-center shadow-xl backdrop-blur-md">
        {/* Pulsing Logo */}
        <div className="animate-pulse opacity-70">
          <Logo size={48} />
        </div>

        {/* Loading Indicator & Text */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary size-6 animate-spin" />

          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            Signing you out securely...
          </p>
        </div>
      </div>
    </div>
  );
}
