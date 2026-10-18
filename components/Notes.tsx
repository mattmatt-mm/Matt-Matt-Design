"use client";

import { useRef, useState, type ReactNode } from "react";
import { SiteSquircle } from "@/components/SiteSquircle";

/**
 * The exact numbers behind an interaction, set as a note in the manner of
 * Apple Notes: a yellow band, a perforated tear line, ruled paper. The prose
 * says what the interaction feels like; the note keeps the recipe, written as
 * a prompt a reader can copy into their own AI tool to rebuild it.
 * See doc/case-study-voice.md.
 */
export function Notes({ title, children }: { title?: string; children: ReactNode }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const body = bodyRef.current;
    if (!body) return;
    // Copied as Markdown, list markers included, so it pastes into a chat
    // as the same list it reads as here.
    const text = [...body.children]
      .map((el) =>
        el.tagName === "UL" || el.tagName === "OL"
          ? [...el.children]
              .map((li, i) =>
                `${el.tagName === "OL" ? `${i + 1}.` : "-"} ${(li as HTMLElement).innerText.trim()}`,
              )
              .join("\n")
          : (el as HTMLElement).innerText.trim(),
      )
      .join("\n\n")
      .trim();
    if (!text) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Embedded views and older browsers refuse the async clipboard; a
      // selected textarea and the legacy copy command still work there.
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.append(area);
      area.select();
      ok = document.execCommand("copy");
      area.remove();
    }
    if (!ok) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteSquircle className="notes" role="note" aria-label={title ?? "Notes"}>
      <div className="notes-band">
        <span className="notes-title">{title ?? "Notes"}</span>
        <button type="button" className="notes-copy" onClick={copy}>
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>
      <div className="notes-perforation" aria-hidden />
      <div ref={bodyRef} className="notes-body">
        {children}
      </div>
    </SiteSquircle>
  );
}
