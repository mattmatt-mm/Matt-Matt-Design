import type { Settings } from "@/lib/content";
import { person, siteDescription, siteName, siteUrl } from "@/lib/site";

/**
 * Schema.org descriptions of the site, for search engines and AI answers. Every
 * value comes from public content: never the AI's CV facts, and never Matt's
 * full name or a photo of him. See doc/seo-plan.md.
 */

const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

const absolute = (path: string) => new URL(path, siteUrl).toString();

export function homeSchema(settings: Settings) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": personId,
      name: person.name,
      jobTitle: person.jobTitle,
      description: siteDescription,
      url: siteUrl,
      email: settings.email ? `mailto:${settings.email}` : undefined,
      address: {
        "@type": "PostalAddress",
        addressLocality: person.locality,
      },
      knowsAbout: person.knowsAbout,
      areaServed: person.areaServed.map((name) => ({ "@type": "Place", name })),
      sameAs: settings.socials.map((s) => s.url).filter(Boolean),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      inLanguage: ["en", "zh-Hant"],
      author: { "@id": personId },
    },
  ];
}

function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: absolute(step.path),
    })),
  };
}

export function caseStudySchema(study: {
  slug: string;
  title: string;
  summary?: string | null;
  cover?: string | null;
  role?: string | null;
  disciplines: readonly string[];
}) {
  const path = `/work/${study.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `${absolute(path)}#work`,
      name: study.title,
      headline: study.title,
      description: study.summary || undefined,
      url: absolute(path),
      image: study.cover ? absolute(study.cover) : undefined,
      genre: study.role || undefined,
      keywords: study.disciplines.length ? study.disciplines.join(", ") : undefined,
      inLanguage: "en",
      creator: { "@id": personId },
      author: { "@id": personId },
      isPartOf: { "@id": websiteId },
    },
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Profile", path: "/profile" },
      { name: study.title, path },
    ]),
  ];
}

export function postSchema(post: {
  slug: string;
  title: string;
  description: string;
  publishedAt?: string | null;
  lang: "en" | "zh";
  cover?: string | null;
}) {
  const path = `/writing/${post.slug}`;
  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${absolute(path)}#post`,
      headline: post.title,
      description: post.description || undefined,
      url: absolute(path),
      mainEntityOfPage: absolute(path),
      datePublished: post.publishedAt || undefined,
      inLanguage: post.lang === "zh" ? "zh-Hant" : "en",
      image: absolute(post.cover || "/opengraph-image.png"),
      author: { "@id": personId, "@type": "Person", name: person.name, url: siteUrl },
      publisher: { "@id": personId },
      isPartOf: { "@id": websiteId },
    },
    breadcrumb([
      { name: "Home", path: "/" },
      { name: "Writing", path: "/writing" },
      { name: post.title, path },
    ]),
  ];
}
