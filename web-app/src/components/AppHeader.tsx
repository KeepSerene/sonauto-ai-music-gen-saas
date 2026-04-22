"use client";

import { Clock } from "lucide-react";
import { Separator } from "~/components/ui/separator";
import AppBreadcrumbs from "~/components/AppBreadcrumbs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import ThemeToggle from "./theme/ThemeToggle";
import { Badge } from "./ui/badge";
import { DAILY_GENERATION_LIMIT } from "~/lib/constants";

interface AppHeaderProps {
  rateLimitResetAt: string | null;
}

function AppHeader({ rateLimitResetAt }: AppHeaderProps) {
  const { open } = useSidebar();

  const resetTime = rateLimitResetAt
    ? new Date(rateLimitResetAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 left-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2 backdrop-blur-sm">
      {/* ── Left: sidebar toggle + breadcrumbs ─────────────────────────── */}
      <div className="flex shrink-0 grow items-center gap-2">
        <Tooltip>
          <TooltipTrigger type="button" asChild>
            <SidebarTrigger
              type="button"
              aria-label={open ? "Close sidebar" : "Open sidebar"}
              className="-ml-2 transition-opacity duration-150 hover:opacity-80"
            />
          </TooltipTrigger>

          <TooltipContent side="bottom">
            {open ? "Close sidebar" : "Open sidebar"}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="not-dark:opacity-60" />

        <AppBreadcrumbs />
      </div>

      {/* ── Right: rate-limit badge (conditional) + theme toggle ────────── */}
      <div className="flex shrink-0 items-center gap-3">
        {resetTime && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-help gap-1 border-amber-500/40 bg-amber-400/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400"
              >
                <Clock className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-sm">Limit</span>
              </Badge>
            </TooltipTrigger>

            <TooltipContent side="bottom" className="max-w-60 text-center">
              You&apos;ve used all {DAILY_GENERATION_LIMIT} daily generations.
              Resets at {resetTime}.
            </TooltipContent>
          </Tooltip>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}

export default AppHeader;
