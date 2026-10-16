"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SiteSquircle } from "@/components/SiteSquircle";

/**
 * The normal cursor stays everywhere; over an element marked
 * `data-cursor="View project"` it becomes a dot with that label floating
 * beside it. Only for a fine pointer that can hover — touch never sees it.
 * Decorative: the link underneath keeps its own name and focus ring. Styles
 * are `.view-cursor` in globals.css; see
 * doc/reading-width-rail-cursor-stats-plan.md.
 */
export function ViewCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!el || !query.matches) return;

    // Only hide the system cursor once this is running, so a page without
    // JavaScript never loses its pointer.
    document.documentElement.dataset.viewCursor = "";
    let x = -100;
    let y = -100;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      el.style.translate = `${x}px ${y}px`;
      const hit = document.elementFromPoint(x, y);
      const target = hit?.closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(evaluate);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      schedule();
    };

    const onLeave = () => setLabel(null);
    // A click can put something new under a still pointer (the image zoom
    // opening or closing), so look again once it has rendered.
    const onClick = () => requestAnimationFrame(schedule);

    window.addEventListener("pointermove", onMove, { passive: true });
    // Scrolling moves the page under a still pointer.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("click", onClick);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      delete document.documentElement.dataset.viewCursor;
    };
  }, []);

  // A new page may not have a target under the pointer.
  useEffect(() => setLabel(null), [pathname]);

  return (
    <div
      ref={ref}
      className="view-cursor"
      data-visible={label ? "" : undefined}
      aria-hidden="true"
    >
      <span className="view-cursor-dot" />
      <SiteSquircle className="view-cursor-label">{label}</SiteSquircle>
    </div>
  );
}
