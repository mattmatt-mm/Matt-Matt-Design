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
 * How search engines and AI answers identify the site. People should find it
 * by "Matt Tam", "Matt Matt Design" or "Matt Design" (Matt, 2026-10-23), so
 * all three are stated here, paired with the city and the specialities. US
 * visitors search for a design engineer, Hong Kong visitors for UI/UX, brand
 * and AI transformation; one set of words serves both.
 *
 * Metadata only: the full name lives in titles, descriptions, structured data
 * and llms.txt, never in the copy a visitor reads on the page, which still
 * says "Matt". See doc/seo-plan.md.
 */
export const siteName = "Matt Matt Design";
/** Other names the site is searched by. */
export const siteAlternateNames = ["Matt Design", "Matt Tam", "mattmattdesign"];
/** The home-screen label, where the brand name is too long to fit. */
export const siteShortName = "Matt";
export const siteTitle =
  "Matt Tam — Matt Matt Design · Design Engineer in Hong Kong";
export const siteDescription =
  "Matt Tam (Matt Matt Design) is a Hong Kong–based design engineer for UI/UX, brand design and AI transformation, most recently the brand system for HKUST ISD.";
/** Searches the site should answer to, most specific first. */
export const siteKeywords = [
  "Matt Tam",
  "Matt Matt Design",
  "Matt Design",
  "Matt Tam designer",
  "design engineer Hong Kong",
  "UI/UX designer Hong Kong",
  "brand designer Hong Kong",
  "AI transformation",
  "HKUST ISD brand",
];

export const person = {
  name: "Matt Tam",
  givenName: "Matt",
  familyName: "Tam",
  /** What the site itself calls him, and the brand he works under. */
  alternateName: ["Matt", "Matt Matt Design", "Matt Design"],
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
