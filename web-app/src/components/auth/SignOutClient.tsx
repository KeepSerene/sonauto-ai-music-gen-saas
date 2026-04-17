"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { authClient } from "~/server/better-auth/client";

export default function SignOutClient() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              // Using window.location.href instead of router.push ensures a full
              // page reload, flushing the Next.js router cache entirely so the
              // user doesn't see a cached version of a protected route.
              window.location.href = "/auth/sign-in";
            },
          },
        });
      } catch (error) {
        console.error("Failed to sign out:", error);
        toast.error("Failed to sign out! Redirecting back...");
        router.replace("/dashboard");
      }
    };

    void performSignOut();
  }, [router]);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="text-primary size-8 animate-spin" />

        <p className="text-muted-foreground animate-pulse text-sm font-medium tracking-wide">
          Signing you out securely...
        </p>
      </div>
    </main>
  );
}
