"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { authClient } from "~/server/better-auth/client";

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={(url) => router.push(url)}
      replace={(url) => router.replace(url)}
      redirectTo="/dashboard"
      credentials={{ forgotPassword: false }}
      onSessionChange={async () => {
        // Clear router cache (protected routes)
        router.refresh();
      }}
      Link={Link}
    >
      {children}
    </AuthUIProvider>
  );
}
