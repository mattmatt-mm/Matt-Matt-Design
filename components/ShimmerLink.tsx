"use client";

import { GradientShimmer } from "gradient-shimmer";
import { useCallback, useEffect, useRef, useState } from "react";

/** Set once the intro links have greeted a visitor, so they only ever do it once. */
const FIRST_VISIT_KEY = "mmd:intro-shimmer-seen";

/** The library's own defaults, restated because the stop timing derives from them. */
const SWEEP_MS = 1450;
const PAUSE_BETWEEN_MS = 700;
const CYCLE_MS = SWEEP_MS + PAUSE_BETWEEN_MS;
/** Covers the few frames between mounting the shimmer and the sweep starting. */
const SETTLE_MS = 80;

/**
 * Answered once per page load and cached, so every link in the intro reads the
 * same answer — otherwise the first one to run its effect would claim the flag
 * and the rest would think they were greeting a returning visitor.
 */
let firstVisit: boolean | null = null;

function isFirstVisit(): boolean {
  if (firstVisit === null) {
    try {
      firstVisit = window.localStorage.getItem(FIRST_VISIT_KEY) === null;
      if (firstVisit) window.localStorage.setItem(FIRST_VISIT_KEY, "1");
    } catch {
      // Storage denied — treat it as a return visit and stay quiet.
      firstVisit = false;
    }
  }
  return firstVisit;
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * An intro link that a sunrise gradient sweeps across — once when a visitor
 * first lands on the site, and again for as long as the pointer rests on it.
 */
export function ShimmerLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  const [sweeping, setSweeping] = useState(false);
  const sweepingNow = useRef(false);
  const startedAt = useRef(0);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const start = useCallback(() => {
    clearTimeout(stopTimer.current);
    if (sweepingNow.current) return; // already running; the pending stop is cancelled
    sweepingNow.current = true;
    startedAt.current = performance.now();
    setSweeping(true);
  }, []);

  // The band only clears the text at the end of a sweep, so stopping anywhere
  // else would cut a gradient off mid-word. Wait out the sweep in progress; in
  // the idle gap the text is already plain and we can drop it straight away.
  const stop = useCallback(() => {
    if (!sweepingNow.current) return;
    const phase = (performance.now() - startedAt.current) % CYCLE_MS;
    const delay = phase >= SWEEP_MS ? 0 : SWEEP_MS - phase + SETTLE_MS;
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      sweepingNow.current = false;
      setSweeping(false);
    }, delay);
  }, []);

  useEffect(() => {
    if (!reducedMotion() && isFirstVisit()) {
      start();
      stop(); // one sweep, then plain text for good
    }
    return () => clearTimeout(stopTimer.current);
  }, [start, stop]);

  const enter = () => {
    if (!reducedMotion()) start();
  };

  return (
    <a
      href={href}
      onPointerEnter={enter}
      onPointerLeave={stop}
      onPointerCancel={stop}
    >
      {sweeping ? (
        <GradientShimmer
          gradient="sunrise"
          pauseBetween={PAUSE_BETWEEN_MS}
          /* Either pause would stall the sweep behind our back and desync the
             stop timing above; the intro sits at the top of a short page. */
          pauseOnScroll={false}
          pauseWhenOffscreen={false}
          /* The library renders an inline-block, and a link's underline is not
             drawn through one — the rule would blink out for the sweep. These
             are single words that never wrap, so a plain inline box is safe. */
          style={{ display: "inline" }}
        >
          {children}
        </GradientShimmer>
      ) : (
        children
      )}
    </a>
  );
}
