import Link from "next/link";
import Image from "next/image";
import { ArrowRight, AudioLines, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "../ui/badge";

const Hero = ({ isAuthenticated }: { isAuthenticated: boolean }) => (
  <section className="relative overflow-hidden px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-24">
    {/* ── Dot grid with radial fade ─────────────────────────────────────── */}
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"
      style={{
        maskImage:
          "radial-gradient(ellipse at center, black 10%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 10%, transparent 80%)",
      }}
    />

    {/* ── Ambient glows ─────────────────────────────────────────────────── */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-start justify-center"
    >
      <div className="not-dark:bg-primary/14 dark:bg-primary/10 -mt-20 h-140 w-175 rounded-full blur-[130px]" />
    </div>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 right-0 translate-x-1/4 -translate-y-1/4"
    >
      <div className="dark:bg-accent/32 not-dark:bg-accent/18 h-100 w-100 rounded-full blur-[100px]" />
    </div>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 -translate-x-1/4 translate-y-1/4"
    >
      <div className="bg-primary/10 h-87.5 w-87.5 rounded-full blur-[100px]" />
    </div>

    {/* ── Content ───────────────────────────────────────────────────────── */}
    <div className="relative z-10 mx-auto max-w-4xl text-center">
      {/* Badge */}
      <Badge
        variant="outline"
        className="border-primary/25 bg-primary/8 text-primary mb-7 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-medium"
      >
        <Sparkles className="size-3" aria-hidden="true" />
        AI Music Generation
      </Badge>

      {/* Headline */}
      <h1 className="text-foreground text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
        Sonata,{" "}
        <span className="text-primary relative inline-block">Automated.</span>
      </h1>

      {/* Sub-headline */}
      <p className="text-muted-foreground mx-auto mt-6 max-w-2xl leading-relaxed sm:text-xl">
        Describe your sound in plain words. Walk away with a complete song —
        lyrics, melody, and artwork — all generated for you.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {isAuthenticated ? (
          <>
            <Button size="lg" asChild>
              <Link href="/generate">
                <span className="hidden sm:inline">Compose a Track</span>
                <span className="sm:hidden">Compose</span>
                <AudioLines className="size-4" aria-hidden="true" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">My Dashboard</Link>
            </Button>
          </>
        ) : (
          <>
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start for Free
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/sign-in">
                <span className="hidden sm:inline">Sign In to Browse</span>
                <span className="sm:hidden">Sign In</span>
              </Link>
            </Button>
          </>
        )}
      </div>

      {/* Trust nudge */}
      {!isAuthenticated && (
        <p className="text-muted-foreground/70 mt-4 text-sm">
          10 free credits on signup — no card required.
        </p>
      )}
    </div>

    {/* ── Hero banner ────────────────────────────────────────────────────── */}
    <div className="relative z-10 mx-auto mt-16 max-w-5xl px-0 sm:px-4">
      <div className="border-border/60 bg-card/20 relative overflow-hidden rounded-xl border shadow-2xl backdrop-blur-sm">
        {/* Light mode image */}
        <Image
          src="/images/hero-banner-light.webp"
          alt="Sonauto AI Music Generation Interface"
          width={1280}
          height={714}
          priority
          className="w-full object-cover dark:hidden"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1024px, 1280px"
        />

        {/* Dark mode image */}
        <Image
          src="/images/hero-banner-dark.webp"
          alt="Sonauto AI Music Generation Interface"
          width={1280}
          height={714}
          priority
          className="w-full object-cover not-dark:hidden"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 1024px, 1280px"
        />

        {/* Subtle inner gradient overlay */}
        <div className="not-dark:from-primary/10 dark:from-primary/25 not-dark:to-accent/45 dark:to-accent/60 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent" />
      </div>
    </div>
  </section>
);

export default Hero;
