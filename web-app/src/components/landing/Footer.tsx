import Link from "next/link";
import Logo from "~/components/Logo";
import { HOME_FOOTER_NAV_LINKS, HOME_FOOTER_SOCIALS } from "~/lib/constants";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const Footer = () => (
  <footer className="border-border/60 border-t px-4 py-12 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">
      {/* Top row */}
      <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        {/* Brand */}
        <div className="flex flex-col gap-3 max-sm:items-center">
          <Link
            href="/"
            aria-label="Sonauto home"
            className="text-foreground hover:text-primary w-fit transition-colors duration-150"
          >
            <Logo />
          </Link>

          <p className="text-muted-foreground max-w-xs text-sm leading-relaxed max-sm:text-center">
            Sonata + Auto. Describe your sound and let AI compose the rest —
            lyrics, melody, and artwork in minutes.
          </p>
        </div>

        {/* Nav + Socials */}
        <div className="flex flex-col items-center gap-6 sm:items-end">
          {/* Quick nav */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2"
          >
            {HOME_FOOTER_NAV_LINKS.map(({ label, href }) => (
              <Button key={href} variant="link" className="px-0" asChild>
                <Link href={href} className="text-sm">
                  {label}
                </Link>
              </Button>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {HOME_FOOTER_SOCIALS.map(({ label, href, icon: Icon }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-2" asChild>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      <Icon className="text-foreground size-4" />
                    </a>
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="bottom">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-border/40 mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 sm:flex-row">
        <p className="text-muted-foreground/70 text-xs">
          &copy; {new Date().getFullYear()} Sonauto. All rights reserved.
        </p>

        <p className="text-muted-foreground/50 text-xs">
          Built with ♪ by KeepSerene
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
