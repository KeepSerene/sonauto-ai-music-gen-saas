import { LayoutDashboard, Music2 } from "lucide-react";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,32}$/;
export const POLAR_STARTER_PACK_ID = "33e1a6a4-6c15-4438-8444-b4d0a600b7cc";
export const POLAR_PRODUCER_PACK_ID = "e448e02c-25d6-49d7-8e4f-c1759e2e5d22";
export const POLAR_STUDIO_PACK_ID = "4a4093ab-6041-4384-aad8-44a518c0bc19";
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/generate",
  "/billing",
  "/account/settings",
];
export const AUTH_ROUTES = ["/auth"];
export const APP_SIDEBAR_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Generate",
    href: "/generate",
    icon: Music2,
  },
];
