import Link from "next/link";
import Logo from "~/components/Logo";
import ThemeToggle from "~/components/theme/ThemeToggle";

const BULLETS = [
  "Describe a vibe, get a complete song",
  "AI lyrics, melody & original artwork",
  "Download as high-quality WAV",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Left branding panel
// ─────────────────────────────────────────────────────────────────────────────
const BrandingPanel = () => (
  <aside className="bg-muted/10 relative hidden w-full flex-col overflow-hidden border-r lg:flex lg:w-1/2 xl:w-[45%]">
    {/* Dot grid background */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />

    {/* Primary color glow orb */}
    <div className="bg-primary/25 absolute top-20 -left-40 h-125 w-125 rounded-full blur-[120px]" />

    {/* Content */}
    <div className="relative z-10 flex h-full flex-col justify-between p-12">
      {/* Logo */}
      <Link
        href="/"
        aria-label="Back to Sonauto home"
        className="w-fit transition-transform hover:scale-105 focus-visible:outline-none"
      >
        <Logo size={32} />
      </Link>

      {/* Central branding block */}
      <div className="flex flex-col gap-8">
        <h2 className="text-foreground text-4xl font-bold tracking-tight lg:text-5xl lg:leading-[1.1]">
          Sonata, <br />
          <span className="text-primary">Automated.</span>
        </h2>

        {/* Bullets */}
        <ul className="flex flex-col gap-4" role="list">
          {BULLETS.map((item) => (
            <li
              key={item}
              className="text-muted-foreground flex items-center gap-3 text-sm font-medium lg:text-base"
            >
              <div className="bg-primary/10 flex size-6 shrink-0 items-center justify-center rounded-full">
                <span className="bg-primary size-2 rounded-full" />
              </div>

              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Footer text */}
      <p className="text-muted-foreground/50 text-sm font-medium">
        &copy; {new Date().getFullYear()} Sonauto. All rights reserved.
      </p>
    </div>
  </aside>
);

// ─────────────────────────────────────────────────────────────────────────────
// Auth layout
// ─────────────────────────────────────────────────────────────────────────────
const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <div className="bg-background flex min-h-dvh w-full">
    {/* Left — branding (desktop only) */}
    <BrandingPanel />

    {/* Right — auth forms */}
    <main className="relative flex w-full flex-col lg:w-1/2 xl:w-[55%]">
      {/* Top bar — Mobile Logo + Theme Toggle */}
      <div className="absolute top-0 right-0 left-0 flex items-center justify-between p-6">
        <Link
          href="/"
          aria-label="Back to Sonauto home"
          className="hover:text-primary transition-colors duration-150 focus-visible:outline-none lg:hidden"
        >
          <Logo size={28} />
        </Link>

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Centered form area */}
      <div className="flex flex-1 items-center justify-center px-6 py-24 sm:px-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      {/* Footer */}
      <div className="px-6 py-6 text-center lg:py-8">
        <p className="text-muted-foreground text-xs">
          By continuing, you agree to Sonauto&apos;s Terms of Service and
          Privacy Policy.
        </p>
      </div>
    </main>
  </div>
);

export default AuthLayout;
