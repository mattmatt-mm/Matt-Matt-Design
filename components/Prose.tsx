import * as React from "react";
import Markdoc, { type Node } from "@markdoc/markdoc";

export function Prose({ node, lang }: { node: Node; lang?: "en" | "zh" }) {
  const content = Markdoc.transform(node);

  return (
    <div
      className={`prose ${lang === "zh" ? "prose-zh" : ""}`}
      lang={lang === "zh" ? "zh-Hant" : undefined}
    >
      {Markdoc.renderers.react(content, React)}
    </div>
  );
}
