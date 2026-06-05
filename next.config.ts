import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow phones on the local network to load Next dev resources reliably.
  // Without this, mobile Safari can receive stale or partially refreshed client code.
  allowedDevOrigins: [
    "192.168.0.103",
    "192.168.1.5",
    "192.168.1.8",
    "192.168.0.10",
  ],
  // Keep production builds from overwriting an active development server's client chunks.
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
