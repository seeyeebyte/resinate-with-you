import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep production builds from overwriting an active development server's client chunks.
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
