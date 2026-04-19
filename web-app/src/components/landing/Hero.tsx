import Link from "next/link";
import { ArrowRight, Music2, Sparkles } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "../ui/badge";

const Hero = () => (
  <section className="relative overflow-hidden px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-20 lg:px-8 lg:pt-32 lg:pb-24">
    {/* ── Ambient glows ─────────────────────────────────────────────────── */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex items-start justify-center"
    >
      {/* Primary centre glow */}
      <div className="bg-primary/18 -mt-20 h-140 w-175 rounded-full blur-[130px]" />
    </div>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-0 right-0 -z-10 translate-x-1/4 -translate-y-1/4"
    >
      <div className="bg-accent/12 h-100 w-100 rounded-full blur-[100px]" />
    </div>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 -z-10 -translate-x-1/4 translate-y-1/4"
    >
      <div className="bg-primary/8 h-87.5 w-87.5 rounded-full blur-[100px]" />
    </div>

    {/* ── Content ───────────────────────────────────────────────────────── */}
    <div className="mx-auto max-w-4xl text-center">
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
      <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl">
        Describe your sound in plain words. Walk away with a complete song —
        lyrics, melody, and artwork — all generated for you.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" asChild className="gap-2">
          <Link href="/auth/sign-up">
            Start for Free
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>

        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">Browse Tracks</Link>
        </Button>
      </div>

      {/* Trust nudge */}
      <p className="text-muted-foreground/70 mt-4 text-sm">
        10 free credits on signup — no card required.
      </p>
    </div>

    {/* ── Hero banner placeholder ────────────────────────────────────────── */}
    {/*
     * TODO: Replace this placeholder with your actual hero screenshot or
     * demo video. Recommended size: 1280×720 (16:9). Use Next.js <Image>
     * with priority={true} for best LCP performance.
     */}
    <div className="mx-auto mt-16 max-w-5xl px-0 sm:px-4">
      <div className="border-border/60 bg-card/20 relative overflow-hidden rounded-xl border backdrop-blur-sm">
        {/* Subtle inner gradient overlay */}
        <div className="from-primary/4 to-accent/4 absolute inset-0 bg-linear-to-br via-transparent" />

        {/* Decorative grid lines */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.3,
          }}
        />

        {/* Placeholder content */}
        <div className="relative flex aspect-video flex-col items-center justify-center gap-4 p-8">
          <div className="border-border/50 bg-background/40 flex size-16 items-center justify-center rounded-2xl border backdrop-blur-sm">
            <Music2 className="text-primary/60 size-8" aria-hidden="true" />
          </div>

          <div className="text-center">
            <p className="text-muted-foreground/60 text-xs font-medium tracking-widest uppercase">
              Hero Banner
            </p>

            <p className="text-muted-foreground/40 mt-1 text-xs">
              Replace with your app screenshot or demo
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
