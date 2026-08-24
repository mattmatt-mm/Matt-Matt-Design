import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A separate dev cache keeps Fast Refresh stable when a production build is
  // running in the same workspace. Production continues to use `.next`.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactStrictMode: true,

  // The AI routes read `content/` at request time through the Keystatic
  // reader, which resolves its paths at runtime — so file tracing cannot see
  // the dependency and shipped the function without a single content file.
  // Pages are prerendered at build time, where the files are simply present,
  // which is why this only ever failed in production and only for the AI:
  // every question fell through to the unknown fallback because the fact list
  // was empty.
  outputFileTracingIncludes: {
    "/api/ai": ["./content/**/*"],
    "/api/ai/contact": ["./content/**/*"],
  },
};

export default nextConfig;
