import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (Next.js 16 default)
  turbopack: {},
  // Skip type checking during build (handled separately)
  typescript: {
    ignoreBuildErrors: process.env.SKIP_BUILD_ERRORS === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_BUILD_ERRORS === 'true',
  },
};

export default nextConfig;
