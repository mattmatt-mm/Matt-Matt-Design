"use client";

import { useEffect, useRef } from "react";

/** The track's angle above horizontal, degrees. */
const ANGLE = 28;
/** Clear space between neighbouring cards, measured across, px. Wispr Flow
 * holds about 133pt at every width; 128 is the nearest step on the scale. */
const GAP = 128;
/** Shear at a card's distance of one step from the centre, degrees. */
const MAX_SKEW = 8;

/**
 * Runs the comment cards along one straight line, bottom left to top right,
 * after the Wispr Flow wall Matt recorded. The section pins for the length of
 * the track and the scroll moves the cards linearly — position follows scroll
 * one to one, with no easing of its own. A card is square at the centre and
 * shears as it travels away from it. Without JavaScript or under reduced
 * motion the cards simply stack in the column.
 */
export function CommentsFloat({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = [...track.querySelectorAll<HTMLElement>(".comment-float")];
    let step = 0;
    let ux = 0;
    let uy = 0;
    let length = 0;
    let frame = 0;

    const layout = () => {
      const angle = (ANGLE * Math.PI) / 180;
      // the gap is held across, so the step along the slope is the card's
      // width plus the gap, stretched by the angle
      step = (cards[0].offsetWidth + GAP) / Math.cos(angle);
      ux = Math.cos(angle);
      uy = -Math.sin(angle);
      length = (cards.length - 1) * step;
      track.style.setProperty("--track-length", `${length}px`);
    };

    const update = () => {
      frame = 0;
      const top = track.getBoundingClientRect().top;
      const p = length ? Math.max(0, Math.min(1, -top / length)) : 0;
      const shift = p * length;
      cards.forEach((card, i) => {
        const d = shift - i * step;
        const skew = Math.min(Math.abs(d) / step, 1) * MAX_SKEW;
        card.style.setProperty("--float-x", `${(d * ux).toFixed(2)}px`);
        card.style.setProperty("--float-y", `${(d * uy).toFixed(2)}px`);
        card.style.setProperty("--float-lean", `${skew.toFixed(3)}deg`);
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      layout();
      schedule();
    };

    track.dataset.track = "on";
    layout();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
      delete track.dataset.track;
    };
  }, []);

  return (
    <div ref={ref} className="comments-track">
      <div className="comments-view">
        <ul className="comments-stage">{children}</ul>
      </div>
    </div>
  );
}
