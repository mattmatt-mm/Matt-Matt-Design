import * as React from "react";
import Link from "next/link";
import Markdoc, {
  type Config,
  type Node,
  type RenderableTreeNode,
  type RenderableTreeNodes,
} from "@markdoc/markdoc";
import { INTERFACE_DEMOS } from "@/lib/interface-demos";
import { Demo } from "./Demo";
import { Flow, Flows } from "./Flows";
import { InterfaceDemo } from "./InterfaceDemo";
import { IsdDotHero } from "./isd/IsdDotHero";
import { LottieSequence } from "./LottieSequence";
import { Notes } from "./Notes";
import { POINT_FIGURES } from "./PointFigure";
import { Point, Points } from "./Points";
import { Recording } from "./Recording";
import { ThumbnailSquircle } from "./SiteSquircle";
import { Stat, Stats } from "./Stats";
import { VideoPlayer } from "./VideoPlayer";

/**
 * Case studies run to nineteen images, so they load as they are scrolled to
 * rather than all at once. Posts can also drop in an interactive example with
 * {% demo kind="easing" /%}, and case studies a screen recording with
 * {% video src="/videos/…" poster="/videos/…-poster.webp" /%}. Either can
 * set out figures with {% stats %}{% stat value="…" label="…" /%}{% /stats %},
 * play Lottie clips in turn with {% lottie %}{% clip src="…" /%}{% /lottie %},
 * line up short points with {% points %}{% point title text /%}{% /points %},
 * or draw a problem as two step lists with {% flows %}{% flow /%}{% /flows %}.
 */

/** Every `clip` inside a `lottie` tag, in order. */
function clipSources(node: Node): string[] {
  return node.children.flatMap((child) =>
    child.type === "tag" && child.tag === "clip"
      ? [String(child.attributes.src)]
      : clipSources(child),
  );
}
/** Plain text of a heading, for its id. */
function textOf(node: Node): string {
  if (node.type === "text") return String(node.attributes.content ?? "");
  return node.children.map(textOf).join("");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

const config = {
  nodes: {
    link: {
      ...Markdoc.nodes.link,
      transform(node: Node, cfg: Config) {
        const attributes = node.transformAttributes(cfg);
        const { href } = attributes;
        const local = typeof href === "string" && /^\/(?![/\\])/.test(href);
        return new Markdoc.Tag(local ? "PortfolioLink" : "a", attributes, node.transformChildren(cfg));
      },
    },
    // Headings carry an id so the section rail can link to them. A tour puts
    // several entries on one page, so the id leads with the entry's slug.
    heading: {
      attributes: { level: { type: Number, required: true } },
      transform(node: Node, cfg: Config) {
        const level = Number(node.attributes.level);
        const prefix = cfg.variables?.idPrefix as string | undefined;
        const slug = slugify(textOf(node));
        return new Markdoc.Tag(
          `h${level}`,
          prefix && slug ? { id: `${prefix}--${slug}` } : {},
          node.transformChildren(cfg),
        );
      },
    },
    image: {
      render: "img",
      attributes: {
        src: { type: String, required: true },
        alt: { type: String },
        title: { type: String },
      },
      // Every image opens larger (components/effects/ImageZoom.tsx), so it is
      // a button to the keyboard and reads "Zoom" under the view cursor.
      transform(node: Node, cfg: Config) {
        const attributes = node.transformAttributes(cfg);
        const alt = typeof attributes.alt === "string" ? attributes.alt : "";
        const rounded = cfg.variables?.roundImages === true;
        const image = new Markdoc.Tag(
          "img",
          {
            ...attributes,
            className: rounded ? "focus-visible:-outline-offset-4" : undefined,
            loading: "lazy",
            decoding: "async",
            "data-zoom": "",
            "data-cursor": "Zoom",
            role: "button",
            tabIndex: 0,
            "aria-label": alt ? `Zoom image: ${alt}` : "Zoom image",
          },
          [],
        );
        return rounded ? new Markdoc.Tag("ThumbnailSquircle", {}, [image]) : image;
      },
    },
  },
  tags: {
    "media-figure": {
      render: "figure",
    },
    "media-caption": {
      transform(node: Node, cfg: Config) {
        return new Markdoc.Tag("figcaption", { className: "media-caption" }, node.transformChildren(cfg));
      },
    },
    "image-pair": {
      transform(node: Node, cfg: Config) {
        return new Markdoc.Tag(
          "div",
          { className: "grid grid-cols-2 items-start gap-3 sm:gap-4" },
          node.transformChildren(cfg),
        );
      },
    },
    lottie: {
      render: "LottieSequence",
      attributes: { title: { type: String } },
      transform(node: Node) {
        return new Markdoc.Tag(
          "LottieSequence",
          { title: node.attributes.title, srcs: clipSources(node) },
          [],
        );
      },
    },
    clip: {
      selfClosing: true,
      attributes: { src: { type: String, required: true } },
    },
    // The HKUST AIS opening: the ISD dot story on a canvas
    // (components/isd/, doc/isd-dot-hero-plan.md).
    "isd-hero": {
      render: "IsdDotHero",
      selfClosing: true,
    },
    // The exact recipe behind an interaction, as a copyable prompt.
    notes: {
      render: "Notes",
      attributes: { title: { type: String } },
    },
    points: {
      render: "Points",
    },
    point: {
      render: "Point",
      selfClosing: true,
      attributes: {
        title: { type: String, required: true },
        text: { type: String },
        figure: { type: String, matches: ["", ...POINT_FIGURES] },
      },
    },
    flows: {
      render: "Flows",
      attributes: {
        outcome: { type: String },
        note: { type: String },
      },
    },
    flow: {
      render: "Flow",
      selfClosing: true,
      attributes: {
        title: { type: String, required: true },
        steps: { type: String, required: true },
      },
    },
    stats: {
      render: "Stats",
    },
    stat: {
      render: "Stat",
      selfClosing: true,
      attributes: {
        value: { type: String, required: true },
        label: { type: String },
      },
    },
    // A recording groups the player and its caption in a figure.
    video: {
      render: "VideoPlayer",
      selfClosing: true,
      attributes: {
        src: { type: String, required: true },
        poster: { type: String },
        title: { type: String },
        caption: { type: String },
      },
      transform(node: Node, cfg: Config) {
        const attributes = node.transformAttributes(cfg);
        return new Markdoc.Tag(
          attributes.caption ? "Recording" : "VideoPlayer",
          attributes,
          [],
        );
      },
    },
    demo: {
      render: "Demo",
      selfClosing: true,
      attributes: {
        kind: {
          type: String,
          required: true,
          matches: [
            "easing",
            "duration",
            "press",
            "transition",
            "squash",
            "anticipation",
            "staging",
            "stagger",
            "arc",
            "secondary",
            "shake",
          ],
        },
      },
    },
    "ui-demo": {
      render: "InterfaceDemo",
      selfClosing: true,
      attributes: {
        kind: { type: String, required: true, matches: Object.keys(INTERFACE_DEMOS) },
      },
    },
  },
};

const components = {
  Demo,
  Flow,
  Flows,
  InterfaceDemo,
  IsdDotHero,
  LottieSequence,
  Notes,
  Point,
  Points,
  PortfolioLink: Link,
  Recording,
  Stat,
  Stats,
  ThumbnailSquircle,
  VideoPlayer,
};

const thumbnailTags = new Set(["IsdDotHero", "LottieSequence", "Recording", "VideoPlayer"]);

function thumbnailEnd(content: RenderableTreeNode[]) {
  const firstHeading = content.findIndex(
    (item) => Markdoc.Tag.isTag(item) && /^h[1-6]$/.test(item.name),
  );
  const lead = firstHeading === -1 ? content : content.slice(0, firstHeading);

  // Only media in the lead counts. A study with no thumbnail keeps its
  // details at the start, before the first section.
  return lead.findLastIndex((item) => {
    if (!Markdoc.Tag.isTag(item)) return false;
    return thumbnailTags.has(item.name) ||
      (item.name === "p" && item.children.some(
        (child) => Markdoc.Tag.isTag(child) && (child.name === "img" || child.name === "ThumbnailSquircle"),
      ));
  }) + 1;
}

export function Prose({
  node,
  lang,
  idPrefix,
  afterThumbnail,
  roundImages,
}: {
  node: Node;
  lang?: "en" | "zh";
  /** The entry's slug; gives its headings page-unique ids. */
  idPrefix?: string;
  /** Optional content between the opening media and the body. */
  afterThumbnail?: React.ReactNode;
  roundImages?: boolean;
}) {
  const transformed = Markdoc.transform(node, {
    ...config,
    variables: { idPrefix, roundImages },
  });

  // Markdoc wraps the document in its own <article>. The page already provides
  // one, so render the children directly rather than nesting them.
  const content = Markdoc.Tag.isTag(transformed)
    ? transformed.children
    : transformed;
  let thumbnail: RenderableTreeNode[] = [];
  let body = content;
  if (afterThumbnail && Array.isArray(content)) {
    const end = thumbnailEnd(content);
    if (end > 0) {
      thumbnail = content.slice(0, end);
      body = content.slice(end);
    }
  }
  const render = (tree: RenderableTreeNodes) =>
    Markdoc.renderers.react(tree, React, { components });

  return (
    <div
      className={`prose ${lang === "zh" ? "prose-zh" : ""}`}
      lang={lang === "zh" ? "zh-Hant" : undefined}
    >
      {thumbnail.length ? render(thumbnail) : null}
      {afterThumbnail}
      {render(body)}
    </div>
  );
}
