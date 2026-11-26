import type { MetadataRoute } from "next";
import { componentCatalog, componentsPath } from "@/lib/component-library";
import {
  getFun,
  lastChanged,
  listExperienceSlugs,
  listWritingSlugs,
} from "@/lib/content";
import { letsWorkPath, profilePath, releasesPath, siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, writing, fun] = await Promise.all([
    listExperienceSlugs(),
    listWritingSlugs(),
    getFun(),
  ]);

  return [
    { url: siteUrl },
    { url: `${siteUrl}${letsWorkPath}` },
    { url: `${siteUrl}/writing` },
    { url: `${siteUrl}/fun` },
    { url: `${siteUrl}${profilePath}` },
    { url: `${siteUrl}/browse` },
    { url: `${siteUrl}${releasesPath}` },
    { url: `${siteUrl}${componentsPath}` },
    ...componentCatalog.map(({ slug }) => ({ url: `${siteUrl}${componentsPath}/${slug}` })),
    ...fun.map((p) => ({ url: `${siteUrl}/fun/${p.slug}` })),
    ...work.map((e) => ({
      url: `${siteUrl}/work/${e.slug}`,
      lastModified: lastChanged(`content/experience/${e.slug}.mdoc`),
    })),
    ...writing.map((e) => ({
      url: `${siteUrl}/writing/${e.slug}`,
      lastModified:
        lastChanged(`content/writing/${e.slug}.mdoc`) ??
        e.entry.publishedAt ??
        undefined,
    })),
  ];
}
