import * as React from "react";
import Markdoc, { type Node } from "@markdoc/markdoc";

/**
 * Case studies run to nineteen images, so they load as they are scrolled to
 * rather than all at once.
 */
const config = {
  nodes: {
    image: {
      render: "img",
      attributes: {
        src: { type: String, required: true },
        alt: { type: String },
        title: { type: String },
      },
      transform(node: Node, cfg: object) {
        return new Markdoc.Tag(
          "img",
          { ...node.transformAttributes(cfg), loading: "lazy", decoding: "async" },
          [],
        );
      },
    },
  },
};

export function Prose({ node, lang }: { node: Node; lang?: "en" | "zh" }) {
  const transformed = Markdoc.transform(node, config);

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
      {Markdoc.renderers.react(content, React)}
    </div>
  );
}
