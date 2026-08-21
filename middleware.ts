import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Proxy POST authentication requests to the backend
  if (
    request.method === "POST" &&
    ["/login", "/register", "/logout", "/forgot-password", "/reset-password"].includes(pathname)
  ) {
    return NextResponse.rewrite(new URL(`${API_URL}${pathname}`, request.url));
  }

  // Check if the auth cookie exists
  const isAuthenticated = request.cookies.has("base23_authenticated");

  // Define path matches
  const isAuthPage = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ].some((path) => pathname === path || pathname.startsWith(path + "/"));

  const isProtectedPage = [
    "/dashboard",
    "/referrals",
    "/directory",
    "/message",
    "/leads",
    "/profile",
    "/settings",
    "/payment",
    "/subscription-required",
    "/admin",
    "/chats",
    "/connected-users",
    "/dealcard",
  ].some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|fonts|images).*)",
  ],
};

