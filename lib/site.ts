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

export const siteName = "Matt";
export const siteTitle = "Matt — Design Engineer";
export const siteDescription =
  "Matt is a design engineer leading brand design at HKUST AIS and co-founder of Incipe Academy.";

/** Default share image for pages that do not provide a project cover. */
export const siteSocialImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: siteTitle,
};
