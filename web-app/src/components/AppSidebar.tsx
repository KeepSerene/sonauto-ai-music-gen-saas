"use client";

import { CreditCard } from "lucide-react";
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

interface AppSidebarProps {
  user: {
    credits: number;
  };
}

export default function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
      <SidebarHeader>
        <Link
          href="/"
          className="text-primary hover:text-primary/90 focus-visible:text-primary/90 w-fit transition-colors duration-150"
        >
          <Logo />
        </Link>
      </SidebarHeader>

      <Separator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {APP_SIDEBAR_ITEMS.map(({ title, href, icon: Icon }) => (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton
                  type="button"
                  isActive={href === pathname}
                  onClick={() => router.push(href)}
                >
                  <Icon className="size-4" />
                  <span>{title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <Separator />

      <SidebarFooter>
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-sm">
            <span className="font-semibold">{user.credits}</span>{" "}
            <span className="text-muted-foreground">Credits</span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUpgrade}
          >
            Upgrade
          </Button>
        </div>

        {/* NOTE: The sign out button in the user button component is not working! */}
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
