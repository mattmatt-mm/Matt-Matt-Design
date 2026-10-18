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

/**
 * How search engines and AI answers identify the site. Matt's full name never
 * appears anywhere on it, so "Matt" is always paired with the brand, the city
 * and the specialities instead. US visitors search for a design engineer, Hong
 * Kong visitors for UI/UX, brand and AI transformation; one set of words serves
 * both. See doc/seo-plan.md.
 */
export const siteName = "Matt Matt Design";
/** The home-screen label, where the brand name is too long to fit. */
export const siteShortName = "Matt";
export const siteTitle =
  "Matt — Design Engineer in Hong Kong · UI/UX, Brand & AI";
export const siteDescription =
  "Matt is a Hong Kong–based design engineer for UI/UX, brand design and AI transformation, most recently the brand system for HKUST ISD.";

export const person = {
  name: "Matt",
  jobTitle: "Design Engineer",
  locality: "Hong Kong",
  knowsAbout: [
    "UI/UX design",
    "Brand design",
    "AI transformation",
    "Frontend development",
  ],
  areaServed: ["United States", "Hong Kong"],
};

/** Default share image for pages that do not provide a project cover. */
export const siteSocialImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: siteTitle,
};
