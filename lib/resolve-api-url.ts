/**
 * Resolve the Laravel backend base URL for Next.js rewrites and auth proxies.
 * Vercel cannot reach private/cluster DNS (DNS_HOSTNAME_RESOLVED_PRIVATE),
 * so those values fall back to the public API host in production.
 */
export function isPrivateOrUnreachableApiHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".svc") ||
      hostname.includes(".svc.cluster.local")
    ) {
      return true;
    }
    // RFC1918 / link-local
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|169\.254\.)/.test(hostname)) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export function resolveApiUrl(env: Partial<NodeJS.ProcessEnv> = process.env): string {
  const raw = (env.API_URL || env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");
  const onVercel = Boolean(env.VERCEL);
  const publicProductionApi = "https://api.noel54.com";

  if (!raw) {
    return onVercel ? publicProductionApi : "http://localhost:8000";
  }

  // On Vercel, never proxy to private/cluster/http-only hosts — those 404 at the edge
  // (DNS_HOSTNAME_RESOLVED_PRIVATE) and break registration/login.
  if (
    onVercel &&
    (isPrivateOrUnreachableApiHost(raw) || !raw.startsWith("https://"))
  ) {
    return publicProductionApi;
  }

  return raw;
}
