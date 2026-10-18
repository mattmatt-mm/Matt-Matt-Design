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
  // Gallery became the home page on 2026-10-17 and the Experience list moved
  // to /profile, so old gallery links land home.
  async redirects() {
    return [{ source: "/gallery", destination: "/", permanent: true }];
  },

  // Engagement tracking (lib/analytics.ts) reaches PostHog through our own
  // domain, so content blockers that drop third-party analytics keep it.
  async rewrites() {
    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
    const assets = host.replace(".i.posthog.com", "-assets.i.posthog.com");
    return [
      { source: "/ingest/static/:path*", destination: `${assets}/static/:path*` },
      { source: "/ingest/array/:path*", destination: `${assets}/array/:path*` },
      { source: "/ingest/:path*", destination: `${host}/:path*` },
    ];
  },
  // PostHog's API paths end in a slash; redirecting them would break capture.
  skipTrailingSlashRedirect: true,

  outputFileTracingIncludes: {
    "/api/ai": ["./content/**/*"],
    "/api/ai/contact": ["./content/**/*"],
  },
};

export default nextConfig;
