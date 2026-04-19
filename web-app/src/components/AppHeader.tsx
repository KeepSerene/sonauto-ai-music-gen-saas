"use client";

import { Separator } from "~/components/ui/separator";
import AppBreadcrumbs from "~/components/AppBreadcrumbs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import ThemeToggle from "./theme/ThemeToggle";

function AppHeader() {
  const { open } = useSidebar();

  return (
    <header className="bg-background/80 supports-backdrop-filter:bg-background/60 sticky top-0 left-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b px-4 py-2 backdrop-blur-sm">
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

      <ThemeToggle />
    </header>
  );
}

export default AppHeader;
