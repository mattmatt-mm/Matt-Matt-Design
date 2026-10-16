"use client";

import { useEffect, useRef, useState } from "react";

type Section = { id: string; text: string };

/** How far down the viewport a heading must pass to become the current one. */
const READ_LINE = 0.3;

/**
 * The quiet table of contents beside a detail page: the current entry's `##`
 * headings, muted, with the one being read in the foreground colour. It
 * follows `DetailChain` — once the next entry's gate opens, it lists that
 * entry instead. Hidden where there is no room beside the column, and when an
 * entry has fewer than two sections. Case-study imagery breaks out of the
 * column and passes beneath the rail, so the rail steps aside (fades) while an
 * image or video overlaps it. Styles are `.section-rail` in
 * globals.css; see doc/reading-width-rail-cursor-stats-plan.md.
 */
export function SectionRail() {
  const [sections, setSections] = useState<Section[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [covered, setCovered] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    let entry: HTMLElement | null = null;
    let headings: HTMLElement[] = [];
    let media: HTMLElement[] = [];
    let frame = 0;

    const update = () => {
      frame = 0;
      const articles = [
        ...document.querySelectorAll<HTMLElement>("[data-chain-entry]"),
      ];
      // The same rule DetailChain uses to hand over the URL: the last entry
      // whose gate is open, or the first, which has no gate.
      const active =
        articles.filter((a, i) => i === 0 || a.dataset.gate === "open").pop() ??
        null;

      if (active !== entry) {
        entry = active;
        headings = active
          ? [...active.querySelectorAll<HTMLElement>(".prose h2[id]")]
          : [];
        media = active
          ? [
              ...active.querySelectorAll<HTMLElement>(
                ".prose img, .prose .video-player, .prose .lottie-sequence",
              ),
            ]
          : [];
        setSections(
          headings.map((h) => {
            // A claim heading with a muted eyebrow above it is listed by its
            // eyebrow ("Problem"), which keeps the rail short.
            const eyebrow = h.previousElementSibling;
            const label =
              eyebrow?.tagName === "H4" ? eyebrow.textContent : h.textContent;
            return { id: h.id, text: label ?? "" };
          }),
        );
        // The rail only measures once it has rendered with these sections.
        requestAnimationFrame(schedule);
      }

      const line = window.innerHeight * READ_LINE;
      const passed = headings.filter(
        (h) => h.getBoundingClientRect().top <= line,
      );
      setCurrent((passed.pop() ?? headings[0])?.id ?? null);

      const rail = ref.current?.getBoundingClientRect();
      setCovered(
        !!rail &&
          rail.width > 0 &&
          media.some((m) => {
            const r = m.getBoundingClientRect();
            return (
              r.left < rail.right &&
              r.top < rail.bottom &&
              r.bottom > rail.top
            );
          }),
      );
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  if (sections.length < 2) return null;

  return (
    <nav
      ref={ref}
      aria-label="Sections"
      className="section-rail"
      data-covered={covered ? "" : undefined}
    >
      <ul>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              aria-current={s.id === current ? "location" : undefined}
            >
              {s.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
