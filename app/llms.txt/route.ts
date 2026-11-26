import { componentCatalog, componentLibraryDescription, componentsPath } from "@/lib/component-library";
import {
  getSettings,
  getWritingEntry,
  listExperienceSlugs,
  listWritingSlugs,
  recognitionLabel,
} from "@/lib/content";
import { person, profilePath, siteDescription, siteName, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain map of the site for AI tools: who Matt is, then every
 * case study, post, and component with a line on each. Public content only; the AI's CV
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
    `- [Profile](${siteUrl}${profilePath}): recognition, project history and client comments`,
    ...settings.socials
      .filter((s) => s.url)
      .map((s) => `- [${s.label}](${s.url})`),
    ...(settings.email ? [`- Email: ${settings.email}`] : []),
  ];

  const recognition = settings.recognitions.map((entry) => {
    const issuer = entry.issuerUrl ? `[${entry.issuer}](${entry.issuerUrl})` : entry.issuer;
    return `- ${recognitionLabel(entry)} · ${issuer}`;
  });

  const body = [
    `# ${siteName}`,
    "",
    `> ${siteDescription}`,
    "",
    `${person.name}, who works as ${siteName} (also known as ${person.alternateName.filter((n) => n !== siteName).join(" and ")}), is a ${person.jobTitle.toLowerCase()} based in ${person.locality}, working with clients in ${person.areaServed.map((place) => (place === "United States" ? "the United States" : place)).join(" and ")}. Areas of work: ${person.knowsAbout.join(", ")}.`,
    "",
    ...(recognition.length
      ? ["## Recognition", "", ...recognition, "", `[Stickers on Matt’s Profile](${siteUrl}${profilePath})`, ""]
      : []),
    "## Case studies",
    "",
    ...studies,
    "",
    "## Writing",
    "",
    ...posts,
    "",
    "## Components",
    "",
    `- [React Component Library](${siteUrl}${componentsPath}): ${componentLibraryDescription}`,
    ...componentCatalog.map(({ slug, title, description }) =>
      `- [${title}](${siteUrl}${componentsPath}/${slug}): ${description}`,
    ),
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
