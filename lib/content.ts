import { createReader } from "@keystatic/core/reader";
import type { Node as MarkdocNode } from "@markdoc/markdoc";
import { imageSize } from "image-size";
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import keystaticConfig from "@/keystatic.config";
import type { Row } from "@/components/RowList";
import type { GalleryEntry } from "@/components/GalleryList";
import type { Discipline } from "@/lib/disciplines";
import type { FunCategory } from "@/lib/fun-categories";

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

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * A post's list label is the month it was published, "26 Aug", read straight
 * from `publishedAt` (YYYY-MM-DD) without a Date, so no timezone can move it
 * into the neighbouring month. Posts from the same month share a label and so
 * form one group.
 */
function monthLabel(publishedAt: string | null | undefined) {
  const [year, month] = (publishedAt ?? "").split("-");
  const name = MONTHS[Number(month) - 1];
  return year && name ? `${year.slice(-2)} ${name}` : "";
}

export async function getWriting(): Promise<Row[]> {
  const all = await reader.collections.writing.all();
  const visible = all.filter((e) => !(hideDrafts && e.entry.draft));
  const sorted = visible.sort((a, b) =>
    (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""),
  );

  return toRows(
    sorted.map((e) => ({
      label: monthLabel(e.entry.publishedAt),
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
    href:
      e.entry.externalUrl ||
      (e.entry.project ? pageFor.get(e.entry.project) : undefined),
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
  const description = entry.summary?.trim() || firstSentences(body);
  return { ...entry, slug, body, description };
}

/**
 * Google shows about 160 characters of a description and trims the rest
 * itself; a little longer lets a short opening question keep the sentence
 * that answers it.
 */
const DESCRIPTION_LENGTH = 200;

/**
 * A post without a summary is described by its opening paragraph, cut at the
 * last sentence end that fits, so Google never shows a sentence broken off
 * mid-word. Handles Chinese full stops as well as English ones.
 */
function firstSentences(body: MarkdocNode): string {
  const paragraph = [...body.walk()].find((n) => n.type === "paragraph");
  if (!paragraph) return "";
  const text = [...paragraph.walk()]
    .filter((n) => n.type === "text")
    .map((n) => String(n.attributes.content ?? ""))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= DESCRIPTION_LENGTH) return text;

  const head = text.slice(0, DESCRIPTION_LENGTH);
  const end = Math.max(
    ...[". ", "? ", "! ", "。", "？", "！"].map((mark) => {
      const i = head.lastIndexOf(mark);
      return i === -1 ? -1 : i + mark.trimEnd().length;
    }),
  );
  return end > 0 ? head.slice(0, end) : `${head.slice(0, head.lastIndexOf(" "))}…`;
}

/**
 * When a content file last changed, from git, for the sitemap. Vercel clones
 * only the most recent commits, and in such a shallow clone every file older
 * than the cut appears to change in the oldest commit it has; that date would
 * be wrong, so it is left out rather than guessed.
 */
export function lastChanged(file: string): string | undefined {
  try {
    const [hash, date] = execFileSync(
      "git",
      ["log", "-1", "--format=%H %cI", "--", file],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    )
      .trim()
      .split(" ");
    if (!hash || !date) return undefined;
    const shallow = execFileSync(
      "git",
      ["rev-parse", "--git-path", "shallow"],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    let cut = "";
    try {
      cut = readFileSync(shallow, "utf8");
    } catch {
      // not a shallow clone — every date is real
    }
    return cut.includes(hash) ? undefined : date;
  } catch {
    return undefined;
  }
}

/**
 * Every case study with a page, in list order, starting at `slug` and wrapping
 * round — the tour a detail page scrolls through. Each appears once.
 */
export async function getCaseStudyTour(slug: string) {
  const pages = (await listExperienceSlugs()).sort(
    (a, b) => (b.entry.order ?? 0) - (a.entry.order ?? 0),
  );
  const start = pages.findIndex((e) => e.slug === slug);
  if (start === -1) return [];

  const ordered = [...pages.slice(start), ...pages.slice(0, start)];
  return Promise.all(ordered.map(toStudy));
}

/**
 * The case studies tagged with any of `picks`, in list order — the guided
 * walkthrough a recruiter asked for. See doc/hr-mode-plan.md.
 */
export async function getDisciplineTour(picks: Discipline[]) {
  const pages = (await listExperienceSlugs())
    .filter((e) => e.entry.disciplines.some((d) => picks.includes(d)))
    .sort((a, b) => (b.entry.order ?? 0) - (a.entry.order ?? 0));
  return Promise.all(pages.map(toStudy));
}

type ExperiencePage = Awaited<ReturnType<typeof listExperienceSlugs>>[number];

async function toStudy(e: ExperiencePage) {
  return {
    slug: e.slug,
    title: e.entry.title,
    start: e.entry.start,
    end: e.entry.end,
    role: e.entry.role,
    team: e.entry.team,
    // Keystatic bundles its own copy of Markdoc — same cast as above.
    body: (await e.entry.body()).node as unknown as MarkdocNode,
  };
}

export type CaseStudy = Awaited<ReturnType<typeof toStudy>>;

export async function listExperienceSlugs() {
  const all = await reader.collections.experience.all();
  return all.filter((e) => e.entry.hasPage && !e.entry.externalUrl);
}

/**
 * Every visible post, newest first as on the Writing list, starting at `slug`
 * and wrapping round — the tour a post page scrolls through.
 */
export async function getWritingTour(slug: string) {
  const posts = (await listWritingSlugs()).sort((a, b) =>
    (b.entry.publishedAt ?? "").localeCompare(a.entry.publishedAt ?? ""),
  );
  const start = posts.findIndex((e) => e.slug === slug);
  if (start === -1) return [];

  const ordered = [...posts.slice(start), ...posts.slice(0, start)];
  return Promise.all(
    ordered.map(async (e) => ({
      slug: e.slug,
      title: e.entry.title,
      lang: e.entry.lang,
      // Keystatic bundles its own copy of Markdoc — same cast as above.
      body: (await e.entry.body()).node as unknown as MarkdocNode,
    })),
  );
}

export async function listWritingSlugs() {
  const all = await reader.collections.writing.all();
  return all.filter((e) => !(hideDrafts && e.entry.draft));
}

/**
 * What the walkthrough splash needs to list a recruiter's selection before
 * the page arrives: every case study with a page, in list order.
 */
export async function getTourCatalog() {
  const pages = (await listExperienceSlugs()).sort(
    (a, b) => (b.entry.order ?? 0) - (a.entry.order ?? 0),
  );
  return pages.map((e) => ({
    slug: e.slug,
    title: e.entry.title,
    disciplines: [...e.entry.disciplines],
  }));
}

export type TourCatalog = Awaited<ReturnType<typeof getTourCatalog>>;

export type Comment = {
  name: string;
  role: string;
  comment: string;
  /** Out of five, in half stars. Absent prints no stars. */
  rating?: number;
  logo?: string;
  initials: string;
};

/** The floating comments under the Experience list on /profile. */
export async function getComments(): Promise<Comment[]> {
  const all = await reader.collections.comments.all();
  return [...all]
    .sort((a, b) => (a.entry.order ?? 0) - (b.entry.order ?? 0))
    .map((e) => ({
      name: e.entry.name,
      role: e.entry.role,
      comment: e.entry.comment,
      rating: e.entry.rating ? Number(e.entry.rating) : undefined,
      logo: e.entry.logo ?? undefined,
      initials: e.entry.initials || e.entry.name.slice(0, 2),
    }));
}

export type FunMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type FunPiece = {
  slug: string;
  title: string;
  subtitle: string;
  category: FunCategory;
  /** YYYY-MM-DD. */
  date: string;
  /** The picture, or the video's still. Absent shows the grey placeholder. */
  image?: FunMedia;
  video?: string;
  more: FunMedia[];
  tools: string;
  /** Hex colours, typed in Keystatic or picked from the image. */
  palette: string[];
  /** A case study page, or an external site. */
  href?: string;
};

const PALETTE_SIZE = 4;

type Rgb = [number, number, number];

function distance(a: Rgb, b: Rgb) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** How far a colour sits from the straight mix of two others. */
function toSegment(c: Rgb, a: Rgb, b: Rgb) {
  const ab = b.map((v, i) => v - a[i]);
  const len = ab.reduce((s, v) => s + v * v, 0);
  const t = len
    ? Math.max(0, Math.min(1, ab.reduce((s, v, i) => s + v * (c[i] - a[i]), 0) / len))
    : 0;
  return distance(c, a.map((v, i) => v + t * ab[i]) as Rgb);
}

/**
 * The colours a picture is made of, most of it first: pixels are binned on a
 * coarse cube, and a bin only counts if it is far enough from every colour
 * already picked, so four shades of one orange read as one dot. Transparent
 * areas are left out rather than counted as white.
 */
async function pickPalette(publicPath: string): Promise<string[]> {
  try {
    const file = path.join(process.cwd(), "public", publicPath);
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .resize(64, 64, { fit: "inside" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bins = new Map<number, { n: number; r: number; g: number; b: number }>();
    let total = 0;
    for (let i = 0; i < data.length; i += info.channels) {
      if (data[i + 3] < 128) continue;
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
      const bin = bins.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
      bin.n += 1;
      bin.r += r;
      bin.g += g;
      bin.b += b;
      bins.set(key, bin);
      total += 1;
    }

    const picked: Rgb[] = [];
    for (const bin of [...bins.values()].sort((a, b) => b.n - a.n)) {
      if (picked.length === PALETTE_SIZE || bin.n < total * 0.002) break;
      const c: Rgb = [bin.r / bin.n, bin.g / bin.n, bin.b / bin.n];
      const distinct = picked.every((p) => distance(p, c) > 56);
      // The soft edge between two colours already picked is a blend of
      // them, not a colour of its own.
      const blend = picked.some((a, i) =>
        picked.slice(i + 1).some((b) => toSegment(c, a, b) < 32),
      );
      if (distinct && !blend) picked.push(c);
    }
    return picked.map(
      (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`.toUpperCase(),
    );
  } catch {
    return [];
  }
}

function funMedia(src: string | null | undefined, alt: string): FunMedia | undefined {
  return src ? { src, alt, ...measure(src) } : undefined;
}

/** The Fun tab, newest first. See doc/fun-tab-plan.md. */
export async function getFun(): Promise<FunPiece[]> {
  const [all, experience] = await Promise.all([
    reader.collections.fun.all(),
    reader.collections.experience.all(),
  ]);

  const pageFor = new Map(
    experience
      .filter((e) => e.entry.hasPage && !e.entry.externalUrl)
      .map((e) => [e.slug, `/work/${e.slug}`]),
  );

  const sorted = [...all].sort((a, b) =>
    (b.entry.date ?? "").localeCompare(a.entry.date ?? ""),
  );

  return Promise.all(
    sorted.map(async ({ slug, entry }) => {
      const typed = entry.palette
        .split(/[\s,]+/)
        .filter((c) => /^#[0-9a-f]{6}$/i.test(c))
        .slice(0, PALETTE_SIZE)
        .map((c) => c.toUpperCase());
      return {
        slug,
        title: entry.title,
        subtitle: entry.subtitle,
        category: entry.category,
        date: entry.date ?? "",
        image: funMedia(entry.image, entry.alt),
        video: entry.video ?? undefined,
        more: entry.more.flatMap((m) => funMedia(m.image, m.alt) ?? []),
        tools: entry.tools,
        palette: typed.length
          ? typed
          : entry.image
            ? await pickPalette(entry.image)
            : [],
        href:
          entry.externalUrl ||
          (entry.project ? pageFor.get(entry.project) : undefined),
      };
    }),
  );
}
