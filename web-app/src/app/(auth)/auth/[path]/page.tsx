import type { Metadata } from "next";
import { AuthView } from "@daveyplate/better-auth-ui";
import { authViewPaths } from "@daveyplate/better-auth-ui/server";

// ─────────────────────────────────────────────────────────────────────────────
// Path -> human-readable title map
// ─────────────────────────────────────────────────────────────────────────────
const PATH_TITLES: Record<string, string> = {
  "sign-in": "Sign In",
  "sign-up": "Create Account",
  "forgot-password": "Forgot Password",
  "reset-password": "Reset Password",
  "verify-email": "Verify Your Email",
  "magic-link": "Magic Link",
  "two-factor": "Two-Factor Auth",
  settings: "Account Settings",
};

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic metadata — title changes per path
// ─────────────────────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] | string }>;
}): Promise<Metadata> {
  const { path } = await params;
  // path can be a string segment or the first element of a catch-all array
  const segment = Array.isArray(path) ? path[0] : path;
  const title = segment ? (PATH_TITLES[segment] ?? "Account") : "Account";

  return { title };
}

// ─────────────────────────────────────────────────────────────────────────────
// Static params — pre-renders all auth views at build time
// ─────────────────────────────────────────────────────────────────────────────
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return <AuthView path={path} />;
}
