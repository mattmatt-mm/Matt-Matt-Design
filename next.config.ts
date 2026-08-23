import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A separate dev cache keeps Fast Refresh stable when a production build is
  // running in the same workspace. Production continues to use `.next`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,
};

export default nextConfig;
