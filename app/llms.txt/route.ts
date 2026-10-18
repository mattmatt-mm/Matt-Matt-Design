import {
  getSettings,
  getWritingEntry,
  listExperienceSlugs,
  listWritingSlugs,
} from "@/lib/content";
import { person, siteDescription, siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain map of the site for AI tools: who Matt is, then every
 * case study and post with a line on each. Public content only; the AI's CV
 * facts never appear here. See doc/seo-plan.md.
 */
export async function GET() {
  const [work, writing, settings] = await Promise.all([
    listExperienceSlugs(),
    listWritingSlugs(),
    getSettings(),
  ]);

  const studies = [...work]
    .sort((a, b) => (b.entry.order ?? 0) - (a.entry.order ?? 0))
    .map((e) => {
      const summary = (e.entry.summary ?? "").replace(/\s+/g, " ").trim();
      return `- [${e.entry.title}](${siteUrl}/work/${e.slug})${summary ? `: ${summary}` : ""}`;
    });

  const posts = await Promise.all(
    [...writing]
      .sort((a, b) =>
        (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""),
      )
      .map(async (e) => {
        const post = await getWritingEntry(e.slug);
        const about = post?.description ? `: ${post.description}` : "";
        return `- [${e.entry.title}](${siteUrl}/writing/${e.slug})${about}`;
      }),
  );

  const links = [
    `- [Profile](${siteUrl}/profile): every project, newest first`,
    ...settings.socials
      .filter((s) => s.url)
      .map((s) => `- [${s.label}](${s.url})`),
    ...(settings.email ? [`- Email: ${settings.email}`] : []),
  ];

  const body = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    `${person.name} is a ${person.jobTitle.toLowerCase()} based in ${person.locality}, working with clients in ${person.areaServed.map((place) => (place === "United States" ? "the United States" : place)).join(" and ")}. Areas of work: ${person.knowsAbout.join(", ")}.`,
    "",
    "## Case studies",
    "",
    ...studies,
    "",
    "## Writing",
    "",
    ...posts,
    "",
    "## Elsewhere",
    "",
    ...links,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
