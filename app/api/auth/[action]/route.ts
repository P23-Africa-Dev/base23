import { NextRequest, NextResponse } from "next/server";
import { resolveApiUrl } from "@/lib/resolve-api-url";

const ALLOWED = new Set([
  "login",
  "register",
  "logout",
  "forgot-password",
  "reset-password",
]);

/**
 * Same-origin auth proxy so browser pages (/login, /register) never hit Laravel on GET,
 * while POSTs still reach the public API with cookies forwarded.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ action: string }> },
) {
  const { action } = await context.params;
  if (!ALLOWED.has(action)) {
    return NextResponse.json({ message: "Not found." }, { status: 404 });
  }

  const API_URL = resolveApiUrl();
  const upstream = `${API_URL}/${action}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");
  headers.set("x-requested-with", "XMLHttpRequest");

  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  const xsrf = request.headers.get("x-xsrf-token");
  if (xsrf) headers.set("x-xsrf-token", xsrf);

  const referer = request.headers.get("referer");
  if (referer) headers.set("referer", referer);

  const origin = request.headers.get("origin");
  if (origin) headers.set("origin", origin);

  let body: ArrayBuffer | undefined;
  if (action !== "logout") {
    body = await request.arrayBuffer();
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(upstream, {
      method: "POST",
      headers,
      body,
      redirect: "manual",
    });
  } catch (err) {
    console.error("[api/auth] upstream fetch failed", action, err);
    return NextResponse.json(
      {
        message:
          "Unable to reach the authentication server. Please try again shortly.",
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  const responseContentType = upstreamResponse.headers.get("content-type");
  if (responseContentType) {
    responseHeaders.set("content-type", responseContentType);
  }

  // Forward all Set-Cookie headers (session + XSRF)
  const getSetCookie = (
    upstreamResponse.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.();
  if (getSetCookie?.length) {
    for (const value of getSetCookie) {
      responseHeaders.append("set-cookie", value);
    }
  } else {
    const single = upstreamResponse.headers.get("set-cookie");
    if (single) responseHeaders.append("set-cookie", single);
  }

  const payload = await upstreamResponse.arrayBuffer();
  return new NextResponse(payload, {
    status: upstreamResponse.status,
    headers: responseHeaders,
  });
}
