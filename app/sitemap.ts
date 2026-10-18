import type { MetadataRoute } from "next";
import {
  lastChanged,
  listExperienceSlugs,
  listWritingSlugs,
} from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, writing] = await Promise.all([
    listExperienceSlugs(),
    listWritingSlugs(),
  ]);

  return [
    { url: siteUrl },
    { url: `${siteUrl}/writing` },
    { url: `${siteUrl}/profile` },
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
