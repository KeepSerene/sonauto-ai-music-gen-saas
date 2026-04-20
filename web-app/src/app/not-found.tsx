"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSearch } from "lucide-react";
import { Button } from "~/components/ui/button";
import Logo from "~/components/Logo";

// Catches all 404s globally
export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main
      className="bg-background flex min-h-dvh flex-col items-center justify-center px-6"
      suppressHydrationWarning
    >
      <div className="absolute top-6 left-7">
        <Link
          href="/"
          replace
          aria-label="Back to home"
          className="text-primary hover:text-primary/90 focus-visible:text-primary/90 w-fit transition-colors duration-150"
        >
          <Logo />
        </Link>
      </div>

      <section className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          {/* Ambient glow */}
          <div
            aria-hidden="true"
            className="not-dark:bg-primary/35 dark:bg-primary/25 absolute size-28 rounded-full blur-2xl"
          />

          <div className="border-border bg-muted relative flex size-20 items-center justify-center rounded-2xl border shadow-sm">
            <FileSearch className="text-muted-foreground size-9" />
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase">
            404
          </p>

          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            Page not found
          </h1>

          <p className="text-muted-foreground text-sm leading-relaxed">
            This page doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-2.5 sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={() => router.replace("/dashboard")}
            aria-label="Go to dashboard"
            className="max-sm:w-full sm:grow"
          >
            Dashboard
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="max-sm:w-full sm:grow"
            asChild
          >
            <Link href="/" replace>
              Go Home
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
