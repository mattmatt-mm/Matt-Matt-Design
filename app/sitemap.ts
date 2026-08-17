import type { MetadataRoute } from "next";
import { listExperienceSlugs, listWritingSlugs } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, writing] = await Promise.all([
    listExperienceSlugs(),
    listWritingSlugs(),
  ]);

  return [
    { url: siteUrl, priority: 1 },
    { url: `${siteUrl}/writing` },
    ...work.map((e) => ({ url: `${siteUrl}/work/${e.slug}` })),
    ...writing.map((e) => ({
      url: `${siteUrl}/writing/${e.slug}`,
      lastModified: e.entry.publishedAt ?? undefined,
    })),
  ];
}
