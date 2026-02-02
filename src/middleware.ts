import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromCookies } from "./utils/auth-utils";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookies = request.headers.get("cookie") || "";
  const session = getSessionFromCookies(cookies);

  // Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Protect User routes
  if (pathname.startsWith("/user")) {
    if (!session || (session.role !== "user" && session.role !== "tenant")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow access to login page even if logged in (for re-login)
  // Users can choose to re-login if they want
  // Remove automatic redirect from login/register pages

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/profile", "/login", "/register"],
};
