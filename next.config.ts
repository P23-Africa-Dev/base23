import type { NextConfig } from "next";
import { resolveApiUrl } from "./lib/resolve-api-url";

const API_URL = resolveApiUrl();

const nextConfig: NextConfig = {
  async rewrites() {
    // afterFiles: App Router pages/route handlers win first (e.g. /register, /api/auth/*).
    // fallback: proxy remaining /api and backend paths that have no Next.js route.
    return {
      afterFiles: [
        {
          source: "/sanctum/:path*",
          destination: `${API_URL}/sanctum/:path*`,
        },
        {
          source: "/logout",
          destination: `${API_URL}/logout`,
        },
        {
          source: "/email/:path*",
          destination: `${API_URL}/email/:path*`,
        },
        {
          source: "/connections/:path*",
          destination: `${API_URL}/connections/:path*`,
        },
        {
          source: "/messages/:path*",
          destination: `${API_URL}/messages/:path*`,
        },
        {
          source: "/saved-users/:path*",
          destination: `${API_URL}/saved-users/:path*`,
        },
        {
          source: "/users/:path*",
          destination: `${API_URL}/users/:path*`,
        },
        {
          source: "/payment/:path*",
          destination: `${API_URL}/payment/:path*`,
        },
      ],
      fallback: [
        {
          source: "/api/:path*",
          destination: `${API_URL}/api/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
