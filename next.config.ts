import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy all Laravel routes to the backend
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
      {
        source: "/login",
        destination: `${API_URL}/login`,
      },
      {
        source: "/logout",
        destination: `${API_URL}/logout`,
      },
      {
        source: "/register",
        destination: `${API_URL}/register`,
      },
      {
        source: "/forgot-password",
        destination: `${API_URL}/forgot-password`,
      },
      {
        source: "/reset-password",
        destination: `${API_URL}/reset-password`,
      },
      {
        source: "/confirm-password",
        destination: `${API_URL}/confirm-password`,
      },
      {
        source: "/password",
        destination: `${API_URL}/password`,
      },
      {
        source: "/profile/:path*",
        destination: `${API_URL}/profile/:path*`,
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
      {
        source: "/sanctum/:path*",
        destination: `${API_URL}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
