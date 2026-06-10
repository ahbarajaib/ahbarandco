import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";
import { isRateLimited } from "@/lib/rate-limiter";

const { auth } = NextAuth(authConfig);

const protectedRoutes = ["/checkout", "/account", "/orders"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPost = req.method === "POST";
  const ip = (req as any).ip || req.headers.get("x-forwarded-for") || "127.0.0.1";

  // Rate limit sensitive POST operations (brute-force prevention)
  if (
    isPost &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/admin/login" ||
      pathname === "/checkout")
  ) {
    if (isRateLimited(ip, 5, 60000)) {
      return new NextResponse("Too many requests. Please try again in 1 minute.", {
        status: 429,
      });
    }
  }

  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isAdminRoute) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (req.auth.user?.role !== "admin") {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/checkout/:path*",
    "/account/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
