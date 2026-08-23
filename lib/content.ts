import { createReader } from "@keystatic/core/reader";
import type { Node as MarkdocNode } from "@markdoc/markdoc";
import { imageSize } from "image-size";
import { readFileSync } from "node:fs";
import path from "node:path";
import keystaticConfig from "@/keystatic.config";
import type { Row } from "@/components/RowList";
import type { GalleryEntry } from "@/components/GalleryList";

const reader = createReader(process.cwd(), keystaticConfig);

/** Drafts stay visible on preview deploys and locally, hidden in production. */
const hideDrafts = process.env.VERCEL_ENV === "production";

export type Settings = {
  name: string;
  role: string;
  intro: string[];
  socials: { label: string; url: string }[];
  email: string;
};

export type AIFactPolicy = "answer" | "contact_only" | "never_answer";

export type AIFact = {
  id: string;
  topic: string;
  aliases: string[];
  policy: AIFactPolicy;
  answer: string;
  source: string;
  lastReviewed: string;
};

export type AIKnowledge = {
  reviewedAt: string;
  voiceRules: string[];
  unknownFallback: string;
  facts: AIFact[];
};

export async function getSettings(): Promise<Settings> {
  const s = await reader.singletons.settings.read();
  return {
    name: s?.name ?? "",
    role: s?.role ?? "",
    intro: [...(s?.intro ?? [])],
    socials: (s?.socials ?? []).map((x) => ({
      label: x.label ?? "",
      url: x.url ?? "",
    })),
    email: s?.email ?? "",
  };
}

/**
 * Only explicitly approved AI fields and already-public experience summaries
 * cross this boundary. Article bodies, drafts, image metadata, and repository
 * files are deliberately excluded.
 */
export async function getAIKnowledge(): Promise<AIKnowledge> {
  const [knowledge, experience] = await Promise.all([
    reader.singletons.aiKnowledge.read(),
    reader.collections.experience.all(),
  ]);

  const configured: AIFact[] = (knowledge?.facts ?? []).map((fact) => ({
    id: fact.id ?? "",
    topic: fact.topic ?? "",
    aliases: [...(fact.aliases ?? [])].filter(Boolean),
    policy: fact.policy ?? "answer",
    answer: fact.answer ?? "",
    source: fact.source ?? "",
    lastReviewed: fact.lastReviewed ?? "",
  }));

  const publicExperience: AIFact[] = experience
    .filter((entry) => Boolean(entry.entry.summary))
    .map((entry) => ({
      id: `experience-${entry.slug}`,
      topic: entry.entry.title,
      aliases: [entry.entry.title, entry.slug.replaceAll("-", " ")],
      policy: "answer",
      answer: entry.entry.summary ?? "",
      source: entry.entry.hasPage
        ? `/work/${entry.slug}`
        : (entry.entry.externalUrl ?? ""),
      lastReviewed: knowledge?.reviewedAt ?? "",
    }));

  return {
    reviewedAt: knowledge?.reviewedAt ?? "",
    voiceRules: [...(knowledge?.voiceRules ?? [])].filter(Boolean),
    unknownFallback:
      knowledge?.unknownFallback ??
      "Matt has not made that information available here. The visitor can leave an email for Matt to follow up.",
    facts: [...configured, ...publicExperience],
  };
}

/**
 * Consecutive entries sharing a label form a group: only the first carries the
 * visible label, and the rule before a new group runs the full column width.
 */
function toRows(
  items: { label: string; title: string; href?: string; lang?: "en" | "zh" }[],
): Row[] {
  return items.map((item, i) => {
    const startsGroup = i === 0 || items[i - 1].label !== item.label;
    return {
      group: item.label,
      label: startsGroup && item.label ? item.label : undefined,
      title: item.title,
      href: item.href,
      lang: item.lang,
    };
  });
}

export async function getExperience(): Promise<Row[]> {
  const all = await reader.collections.experience.all();
  const sorted = [...all].sort(
    (a, b) => (b.entry.order ?? 0) - (a.entry.order ?? 0),
  );

  return toRows(
    sorted.map((e) => ({
      label: e.entry.label ?? "",
      title: e.entry.title,
      href: e.entry.externalUrl
        ? e.entry.externalUrl
        : e.entry.hasPage
          ? `/work/${e.slug}`
          : undefined,
    })),
  );
}

export async function getWriting(): Promise<Row[]> {
  const all = await reader.collections.writing.all();
  const visible = all.filter((e) => !(hideDrafts && e.entry.draft));
  const sorted = visible.sort((a, b) =>
    (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""),
  );

  return toRows(
    sorted.map((e) => ({
      label: e.entry.label ?? "",
      title: e.entry.title,
      href: `/writing/${e.slug}`,
      lang: e.entry.lang,
    })),
  );
}

/** Intrinsic size, read at build time so next/image never guesses. */
function measure(publicPath: string): { width: number; height: number } {
  try {
    const file = path.join(process.cwd(), "public", publicPath);
    const { width, height } = imageSize(readFileSync(file));
    if (width && height) return { width, height };
  } catch {
    // fall through to the mockup's 5:3 placeholder ratio
  }
  return { width: 500, height: 300 };
}

export async function getGallery(): Promise<GalleryEntry[]> {
  const [all, experience] = await Promise.all([
    reader.collections.gallery.all(),
    reader.collections.experience.all(),
  ]);

  // an image only links out if the case study it points at actually has a page
  const pageFor = new Map(
    experience
      .filter((e) => e.entry.hasPage && !e.entry.externalUrl)
      .map((e) => [e.slug, `/work/${e.slug}`]),
  );

  const sorted = [...all].sort((a, b) =>
    (b.entry.date ?? "").localeCompare(a.entry.date ?? ""),
  );

  return sorted.map((e) => ({
    caption: e.entry.caption,
    projectName: e.entry.projectName ?? "",
    image: e.entry.image ?? undefined,
    alt: e.entry.alt ?? "",
    href: e.entry.project ? pageFor.get(e.entry.project) : undefined,
    ...(e.entry.image ? measure(e.entry.image) : {}),
  }));
}

export async function getExperienceEntry(slug: string) {
  const entry = await reader.collections.experience.read(slug);
  if (!entry) return null;
  // Keystatic bundles its own copy of Markdoc, so the node it hands back is
  // structurally identical but nominally a different type. One cast, here.
  const body = (await entry.body()).node as unknown as MarkdocNode;
  return { ...entry, slug, body };
}

export async function getWritingEntry(slug: string) {
  const entry = await reader.collections.writing.read(slug);
  if (!entry) return null;
  if (hideDrafts && entry.draft) return null;
  // Keystatic bundles its own copy of Markdoc, so the node it hands back is
  // structurally identical but nominally a different type. One cast, here.
  const body = (await entry.body()).node as unknown as MarkdocNode;
  return { ...entry, slug, body };
}

export async function listExperienceSlugs() {
  const all = await reader.collections.experience.all();
  return all.filter((e) => e.entry.hasPage && !e.entry.externalUrl);
}

export async function listWritingSlugs() {
  const all = await reader.collections.writing.all();
  return all.filter((e) => !(hideDrafts && e.entry.draft));
}
