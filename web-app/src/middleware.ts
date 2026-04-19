import { NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./lib/constants";
import { getSessionCookie } from "better-auth/cookies";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isSignOutRoute = pathname === "/auth/sign-out";

  if (!isProtectedRoute && !isAuthRoute && !isSignOutRoute) {
    return NextResponse.next();
  }

  // Optimistic Edge check
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  // 1. Block unauthenticated users from protected routes AND the sign-out route
  if ((isProtectedRoute || isSignOutRoute) && !isAuthenticated) {
    const signInUrl = new URL("/auth/sign-in", request.nextUrl.origin);

    return NextResponse.redirect(signInUrl);
  }

  // 2. If it's an auth route (except for sign-out) -> bounce authenticated users to dashboard
  if (isAuthRoute && !isSignOutRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Ignore API routes, Next.js internals, public images folder, and both favicon formats
    "/((?!api|_next/static|_next/image|images|favicon.svg|favicon.ico).*)",
  ],
};
