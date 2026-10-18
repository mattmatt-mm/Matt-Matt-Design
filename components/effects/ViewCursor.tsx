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
 *
 * The dot is its own layer so it can invert whatever is beneath it — a dark
 * image would swallow a dark dot. Inside the label's layer it could not: that
 * layer's fade and blur isolate it, and a blend there has nothing to blend with.
 * It shrinks while the button is held. Matt asked for both on 2026-10-18.
 */
export function ViewCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    const dot = dotRef.current;
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!el || !dot || !query.matches) return;

    // Only hide the system cursor once this is running, so a page without
    // JavaScript never loses its pointer.
    document.documentElement.dataset.viewCursor = "";
    let x = -100;
    let y = -100;
    let frame = 0;

    const evaluate = () => {
      frame = 0;
      el.style.translate = `${x}px ${y}px`;
      dot.style.translate = `${x}px ${y}px`;
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
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") dot.dataset.pressed = "";
    };
    const onUp = () => delete dot.dataset.pressed;
    // A click can put something new under a still pointer (the image zoom
    // opening or closing), so look again once it has rendered.
    const onClick = () => requestAnimationFrame(schedule);

    window.addEventListener("pointermove", onMove, { passive: true });
    // Scrolling moves the page under a still pointer.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("click", onClick);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("click", onClick);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      delete document.documentElement.dataset.viewCursor;
    };
  }, []);

  // A new page may not have a target under the pointer.
  useEffect(() => setLabel(null), [pathname]);

  return (
    <>
      <span
        ref={dotRef}
        className="view-cursor-dot"
        data-visible={label ? "" : undefined}
        aria-hidden="true"
      />
      <div
        ref={ref}
        className="view-cursor"
        data-visible={label ? "" : undefined}
        aria-hidden="true"
      >
        <SiteSquircle className="view-cursor-label">{label}</SiteSquircle>
      </div>
    </>
  );
}
