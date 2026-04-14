"use client";

import { Separator } from "~/components/ui/separator";
import AppBreadcrumbs from "~/components/AppBreadcrumbs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

function AppHeader() {
  const { open } = useSidebar();

  return (
    <header className="bg-background sticky top-0 left-0 z-10 flex shrink-0 items-center border-b px-4 py-2">
      <div className="flex shrink-0 grow items-center gap-2">
        <Tooltip>
          <TooltipTrigger type="button" asChild>
            <SidebarTrigger
              type="button"
              aria-label={open ? "Close sidebar" : "Open sidebar"}
              className="-ml-2"
            />
          </TooltipTrigger>

          <TooltipContent side="bottom">
            {open ? "Close sidebar" : "Open sidebar"}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" />

        <AppBreadcrumbs />
      </div>
    </header>
  );
}

export default AppHeader;
