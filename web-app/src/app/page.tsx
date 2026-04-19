import type { Metadata } from "next";
import Features from "~/components/landing/Features";
import Footer from "~/components/landing/Footer";
import Header from "~/components/landing/Header";
import Hero from "~/components/landing/Hero";
import HowItWorks from "~/components/landing/HowItWorks";
import Pricing from "~/components/landing/Pricing";
import { getSession } from "~/server/better-auth/server";

export const metadata: Metadata = {
  title: "Sonauto — Sonata, Automated",
  description:
    "Turn any idea into a full song — AI-written lyrics, original melody, and unique artwork — in minutes. Describe your vision and let Sonauto compose the rest.",
};

export default async function LandingPage() {
  const session = await getSession();
  const isAuthenticated = !!session?.user;

  return (
    <div className="bg-background relative flex min-h-dvh flex-col">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}
