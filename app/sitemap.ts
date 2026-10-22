import type { MetadataRoute } from "next";
import {
  getFun,
  lastChanged,
  listExperienceSlugs,
  listWritingSlugs,
} from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, writing, fun] = await Promise.all([
    listExperienceSlugs(),
    listWritingSlugs(),
    getFun(),
  ]);

  return [
    { url: siteUrl },
    { url: `${siteUrl}/writing` },
    { url: `${siteUrl}/fun` },
    { url: `${siteUrl}/profile` },
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
