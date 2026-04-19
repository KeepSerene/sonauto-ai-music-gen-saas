"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "~/components/Logo";
import ThemeToggle from "~/components/theme/ThemeToggle";
import { Button } from "~/components/ui/button";
import { Menu, X, Loader2 } from "lucide-react";
import { authClient } from "~/server/better-auth/client";
import { toast } from "sonner";
import { HOME_NAV_LINKS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface LandingHeaderProps {
  isAuthenticated: boolean;
}

export default function Header({ isAuthenticated }: LandingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const router = useRouter();

  // Frosted glass effect on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 left-0 z-50 w-full border-b transition-all duration-200",
        scrolled
          ? "border-border/60 bg-background/80 shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Sonauto home"
          className="text-foreground hover:text-primary focus-visible:text-primary shrink-0 transition-colors duration-150"
        >
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {HOME_NAV_LINKS.map(({ label, href }) => (
            <Button key={href} variant="link" className="px-0" asChild>
              <a href={href} className="text-sm">
                {label}
              </a>
            </Button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              {/* Authenticated: Dashboard + Sign Out */}
              <Button size="lg" asChild className="hidden md:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                disabled={isSigningOut}
                onClick={handleSignOut}
                aria-label={isSigningOut ? "Signing out" : "Log out"}
                className="hidden md:inline-flex"
              >
                {isSigningOut ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Sign Out"
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Guest: Sign In + Get Started */}
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="hidden md:inline-flex"
              >
                <Link href="/auth/sign-in">Sign In</Link>
              </Button>

              <Button size="lg" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}

          {/* Mobile menu toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="md:hidden"
                onClick={() => setMobileOpen((prev) => !prev)}
              >
                {mobileOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              {mobileOpen ? "Close menu" : "Open menu"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="border-border/60 bg-background/95 border-t backdrop-blur-md md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6">
            {HOME_NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                onClick={closeMobile}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150"
              >
                {label}
              </a>
            ))}

            <div className="border-border/40 mt-2 flex flex-col gap-1 border-t pt-3">
              {isAuthenticated ? (
                <>
                  <Button size="lg" asChild>
                    <Link href="/dashboard" onClick={closeMobile} className="">
                      Dashboard
                    </Link>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSigningOut}
                    onClick={async () => {
                      await handleSignOut();
                      closeMobile();
                    }}
                    className=""
                  >
                    {isSigningOut && (
                      <Loader2 className="size-3.5 animate-spin" />
                    )}
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="lg" asChild>
                    <Link
                      href="/auth/sign-in"
                      onClick={closeMobile}
                      className=""
                    >
                      Sign In
                    </Link>
                  </Button>

                  <Button size="lg" asChild>
                    <Link
                      href="/auth/sign-up"
                      onClick={closeMobile}
                      className=""
                    >
                      Get Started
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
