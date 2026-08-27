import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveApiUrl } from "@/lib/resolve-api-url";

const AUTH_POST_PATHS = new Set([
  "/login",
  "/register",
  "/logout",
  "/forgot-password",
  "/reset-password",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const API_URL = resolveApiUrl();

  // Proxy auth POSTs to Laravel (pages stay on Next.js for GET)
  if (request.method === "POST" && AUTH_POST_PATHS.has(pathname)) {
    const destination = new URL(`${API_URL}${pathname}`);
    destination.search = request.nextUrl.search;
    return NextResponse.rewrite(destination);
  }

  const isAuthenticated = request.cookies.has("base23_authenticated");
  const bypassOverride = request.cookies.get("base23_bypass_auth_override")?.value;

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

  // Allowed on manual override, local dev, or vercel preview/dev deployments
  const isBypassAllowed =
    process.env.NEXT_PUBLIC_BYPASS_AUTH === "true" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "development" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ||
    process.env.NODE_ENV === "development";

  // Check if auth bypass is active globally and not explicitly disabled via cookie override
  const isBypassEnabled = isBypassAllowed && bypassOverride !== "enforced";

  if (isProtectedPage && !isAuthenticated && !isBypassEnabled) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && isAuthenticated && !isBypassEnabled) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|fonts|images).*)",
  ],
};
