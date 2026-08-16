/**
 * Canonical origin. Vercel sets VERCEL_PROJECT_PRODUCTION_URL automatically;
 * override with NEXT_PUBLIC_SITE_URL if the domain ever changes.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://mattmattdesign.com");
