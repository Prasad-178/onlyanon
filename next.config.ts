import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip type checking during build (handled separately)
  typescript: {
    ignoreBuildErrors: process.env.SKIP_BUILD_ERRORS === 'true',
  },
};

export default nextConfig;
