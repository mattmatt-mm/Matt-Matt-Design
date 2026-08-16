import * as React from "react";
import Markdoc, { type Node } from "@markdoc/markdoc";

export function Prose({ node, lang }: { node: Node; lang?: "en" | "zh" }) {
  const transformed = Markdoc.transform(node);

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
