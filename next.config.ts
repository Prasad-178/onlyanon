import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Solana wallet adapter and Privy
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // Skip type checking during build (handled separately)
  typescript: {
    ignoreBuildErrors: process.env.SKIP_BUILD_ERRORS === 'true',
  },
  eslint: {
    ignoreDuringBuilds: process.env.SKIP_BUILD_ERRORS === 'true',
  },
};

export default nextConfig;
