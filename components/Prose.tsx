import * as React from "react";
import Markdoc, { type Config, type Node } from "@markdoc/markdoc";
import { Demo } from "./Demo";
import { Flow, Flows } from "./Flows";
import { LottieSequence } from "./LottieSequence";
import { Point, Points } from "./Points";
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
      transform(node: Node, cfg: object) {
        const attributes = node.transformAttributes(cfg);
        const alt = typeof attributes.alt === "string" ? attributes.alt : "";
        return new Markdoc.Tag(
          "img",
          {
            ...attributes,
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
      },
    },
  },
  tags: {
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
    points: {
      render: "Points",
    },
    point: {
      render: "Point",
      selfClosing: true,
      attributes: {
        title: { type: String, required: true },
        text: { type: String },
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
    video: {
      render: "VideoPlayer",
      selfClosing: true,
      attributes: {
        src: { type: String, required: true },
        poster: { type: String },
        title: { type: String },
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
  },
};

export function Prose({
  node,
  lang,
  idPrefix,
}: {
  node: Node;
  lang?: "en" | "zh";
  /** The entry's slug; gives its headings page-unique ids. */
  idPrefix?: string;
}) {
  const transformed = Markdoc.transform(node, {
    ...config,
    variables: { idPrefix },
  });

  // Markdoc wraps the document in its own <article>. The page already provides
  // one, so render the children directly rather than nesting them.
  const content = Markdoc.Tag.isTag(transformed)
    ? transformed.children
    : transformed;

  return (
    <div
      className={`prose ${lang === "zh" ? "prose-zh" : ""}`}
      lang={lang === "zh" ? "zh-Hant" : undefined}
    >
      {Markdoc.renderers.react(content, React, { components: {
          Demo,
          Flow,
          Flows,
          LottieSequence,
          Point,
          Points,
          Stat,
          Stats,
          VideoPlayer,
        } })}
    </div>
  );
}
