import { componentCatalog, componentLibraryDescription, componentsPath, type LibraryModule } from "@/lib/component-library";
import { recognitionLabel, type Settings } from "@/lib/content";
import {
  person,
  profilePath,
  profileTitle,
  siteAlternateNames,
  siteDescription,
  siteName,
  siteUrl,
} from "@/lib/site";

/**
 * Schema.org descriptions of the site, for search engines and AI answers. Every
 * value comes from public content: never the AI's CV facts, and never a photo
 * of Matt. His full name is here because search should find him by it; the
 * page copy still says "Matt". See doc/seo-plan.md.
 */

const personId = `${siteUrl}/#person`;
const websiteId = `${siteUrl}/#website`;

const absolute = (path: string) => new URL(path, siteUrl).toString();
const componentCatalogId = `${absolute(componentsPath)}#catalog`;

function personEntity(settings: Settings) {
  return {
    "@type": "Person",
    "@id": personId,
    name: person.name,
    givenName: person.givenName,
    familyName: person.familyName,
    alternateName: person.alternateName,
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
  };
}

export function homeSchema(settings: Settings) {
  return [
    { "@context": "https://schema.org", ...personEntity(settings) },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      name: siteName,
      alternateName: siteAlternateNames,
      url: siteUrl,
      description: siteDescription,
      inLanguage: ["en", "zh-Hant"],
      author: { "@id": personId },
    },
  ];
}

export function profileSchema(settings: Settings, description: string) {
  const url = absolute(profilePath);
  const awards = settings.recognitions
    .filter(({ kind }) => kind === "award")
    .map(recognitionLabel);
  const credentials = settings.recognitions
    .filter(({ kind }) => kind === "certificate")
    .map(({ name, issuer, issuerUrl, year }) => ({
      "@type": "EducationalOccupationalCredential",
      name,
      credentialCategory: "Certificate",
      description: year === null ? undefined : `Earned in ${year}.`,
      recognizedBy: {
        "@type": "Organization",
        name: issuer,
        url: issuerUrl || undefined,
      },
    }));

  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: `${person.name} — ${siteName}`,
    description,
    isPartOf: { "@id": websiteId },
    mainEntity: {
      ...personEntity(settings),
      description,
      award: awards.length ? awards : undefined,
      hasCredential: credentials.length ? credentials : undefined,
    },
  };
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

const componentTrail = [
  { name: "Browse", path: "/browse" },
  { name: "Components", path: componentsPath },
];

export function componentCatalogSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": componentCatalogId,
      name: "Components",
      description: componentLibraryDescription,
      url: absolute(componentsPath),
      isPartOf: { "@id": websiteId },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: componentCatalog.map(({ slug, title }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: title,
          url: absolute(`${componentsPath}/${slug}`),
        })),
      },
    },
    breadcrumb(componentTrail),
  ];
}

export function componentSchema(component: LibraryModule, hasSource: boolean) {
  const path = `${componentsPath}/${component.slug}`;
  const url = absolute(path);
  return [
    {
      "@context": "https://schema.org",
      "@type": hasSource ? "SoftwareSourceCode" : "CreativeWork",
      "@id": `${url}#component`,
      name: component.title,
      description: component.description,
      url,
      mainEntityOfPage: url,
      inLanguage: "en",
      programmingLanguage: hasSource ? "TypeScript" : undefined,
      runtimePlatform: hasSource ? "React" : undefined,
      author: { "@id": personId },
      isPartOf: { "@id": componentCatalogId },
    },
    breadcrumb([...componentTrail, { name: component.title, path }]),
  ];
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
      { name: profileTitle, path: profilePath },
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
