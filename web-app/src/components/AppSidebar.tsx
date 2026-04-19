"use client";

import { CreditCard, Sparkles, Zap } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Separator } from "./ui/separator";
import { UserButton } from "@daveyplate/better-auth-ui";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { authClient } from "~/server/better-auth/client";
import {
  APP_SIDEBAR_ITEMS,
  POLAR_PRODUCER_PACK_ID,
  POLAR_STARTER_PACK_ID,
  POLAR_STUDIO_PACK_ID,
} from "~/lib/constants";
import Logo from "./Logo";
import { cn } from "~/lib/utils";

interface AppSidebarProps {
  user: {
    credits: number;
  };
}

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLowCredits = user.credits <= 4;

  const handleUpgrade = async () => {
    try {
      await authClient.checkout({
        products: [
          POLAR_STARTER_PACK_ID,
          POLAR_PRODUCER_PACK_ID,
          POLAR_STUDIO_PACK_ID,
        ],
      });
    } catch (error) {
      console.error("Failed to upgrade:", error);
      toast.error("Failed to upgrade your pack.");
    }
  };

  return (
    <Sidebar>
      {/* ── Header ───────────────────────────────────────────────── */}
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/"
          className="text-primary hover:text-primary/80 focus-visible:ring-ring w-fit rounded-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <Logo />
        </Link>
      </SidebarHeader>

      <Separator className="opacity-60" />

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarMenu className="gap-0.5">
            {APP_SIDEBAR_ITEMS.map(({ title, href, icon: Icon }) => {
              const isActive = href === pathname;

              return (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton
                    type="button"
                    isActive={isActive}
                    onClick={() => router.push(href)}
                    className={cn(
                      "group relative h-9 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="bg-primary absolute top-1/2 left-0 h-full w-1 -translate-y-1/2 rounded-lg" />
                    )}

                    <Icon
                      className={cn(
                        "size-4 shrink-0 transition-colors duration-150",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />

                    <span>{title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <Separator className="opacity-60" />

      {/* ── Footer ───────────────────────────────────────────────── */}
      <SidebarFooter className="gap-3 px-3 py-3">
        {/* Credits card */}
        <div className="bg-muted/50 border-border rounded-lg border px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Zap
                className={cn(
                  "size-3.5 shrink-0",
                  isLowCredits ? "text-destructive" : "text-primary",
                )}
              />
              <span className="text-muted-foreground text-xs font-medium">
                Credits
              </span>
            </div>

            <span
              className={cn(
                "text-sm font-semibold tabular-nums transition-colors duration-200",
                isLowCredits ? "text-destructive" : "text-foreground",
              )}
            >
              {user.credits}
            </span>
          </div>

          {isLowCredits && (
            <p className="text-destructive/80 mt-1.5 text-[10px] leading-tight">
              Running low — top up to keep creating.
            </p>
          )}
        </div>

        {/* Upgrade button */}
        <Button
          type="button"
          size="default"
          onClick={handleUpgrade}
          className={cn(
            "relative w-full overflow-hidden rounded-lg text-sm font-semibold",
            "from-primary via-primary/90 to-accent bg-linear-to-r",
            "text-primary-foreground",
            "shadow-sm",
            "transition-all duration-200",
            "hover:shadow-primary/20 hover:shadow-md hover:brightness-110",
            "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "active:scale-[0.98]",
          )}
        >
          <Sparkles className="size-3.5" />
          Upgrade
        </Button>

        {/* User button */}
        <UserButton
          type="button"
          variant="ghost"
          size="default"
          additionalLinks={[
            {
              label: "Billing",
              href: "/billing",
              icon: <CreditCard className="size-4" />,
            },
          ]}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
