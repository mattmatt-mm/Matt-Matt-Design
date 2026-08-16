/**
 * Canonical origin, used for metadata, the sitemap and the RSS feed.
 *
 * Deliberately not derived from Vercel's env vars: VERCEL_PROJECT_PRODUCTION_URL
 * is the project's *.vercel.app address, so using it advertised that domain as
 * canonical instead of this one. Preview deployments point at production too,
 * which is what canonical tags should say.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mattmattdesign.com";
