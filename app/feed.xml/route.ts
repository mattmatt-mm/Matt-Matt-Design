import { getSettings, listWritingSlugs } from "@/lib/content";
import { siteUrl } from "@/lib/site";

const escape = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] as string,
  );

export async function GET() {
  const [entries, settings] = await Promise.all([
    listWritingSlugs(),
    getSettings(),
  ]);

  const sorted = [...entries].sort((a, b) =>
    (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""),
  );

  const items = sorted
    .map((e) => {
      const url = `${siteUrl}/writing/${e.slug}`;
      const date = e.entry.publishedAt
        ? new Date(`${e.entry.publishedAt}T00:00:00Z`).toUTCString()
        : undefined;

      return [
        "    <item>",
        `      <title>${escape(e.entry.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        date ? `      <pubDate>${date}</pubDate>` : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(settings.name || "Matt")} — Writing</title>
    <link>${siteUrl}/writing</link>
    <description>Writing by ${escape(settings.name || "Matt")}.</description>
    <language>en</language>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
