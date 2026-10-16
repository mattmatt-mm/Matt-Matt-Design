"use client";

import { useEffect, useRef } from "react";

/**
 * Runs a tour of detail pages — case studies under `/work`, posts under
 * `/writing`. Every entry is already in the page, so moving between them is
 * ordinary scrolling — nothing swaps, nothing resets, and touch momentum
 * carries on.
 *
 * Each entry after the first opens with a gate (`ChainGate`): its title holds
 * still for a screen of scrolling (see `.chain-gate` in globals.css). This
 * writes how far through it the reader is as `--gate-progress`; once a gate is
 * fully passed it marks the article open, which lets its content in, and
 * hands that entry the URL and the tab title. Scrolling back up reverses both.
 */
export function DetailChain({
  basePath,
  children,
}: {
  /** Where entries live: `/work` or `/writing`. */
  basePath: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const articles = [
      ...root.querySelectorAll<HTMLElement>("[data-chain-entry]"),
    ];
    if (articles.length < 2) return;
    const gates = articles.map((article) => {
      const gate = article.querySelector<HTMLElement>("[data-chain-gate]");
      const head = gate?.querySelector<HTMLElement>("[data-chain-gate-head]");
      const friction = gate?.querySelector<HTMLElement>(
        "[data-chain-gate-friction]",
      );
      return gate && head && friction ? { gate, head, friction } : null;
    });

    // Content under a gate is hidden only from here on, so a page that never
    // runs this script still shows everything.
    root.dataset.chain = "ready";
    let current = window.location.pathname;

    const update = () => {
      let active = articles[0];

      gates.forEach((parts, i) => {
        if (!parts) return;
        const { gate, head, friction } = parts;
        // The title sticks with its bottom edge here; from then on, the
        // spacer below it scrolls past underneath for one screen.
        const heldBottom =
          parseFloat(getComputedStyle(head).top) + head.offsetHeight;
        const distance = friction.offsetHeight;
        const travelled = heldBottom - friction.getBoundingClientRect().top;
        const progress =
          distance > 0 ? Math.min(Math.max(travelled / distance, 0), 1) : 1;
        gate.style.setProperty("--gate-progress", progress.toFixed(4));

        // Sub-pixel scroll positions can stop a hair short of exactly 1.
        const open = progress >= 0.999;
        articles[i].dataset.gate = open ? "open" : "closed";
        if (open) active = articles[i];
      });

      const path = `${basePath}/${active.dataset.chainEntry}`;
      if (path === current) return;
      current = path;
      // Replace, not push: Back still leaves the tour for the list.
      window.history.replaceState(window.history.state, "", path);
      if (active.dataset.title) document.title = active.dataset.title;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      delete root.dataset.chain;
    };
  }, [basePath]);

  return <div ref={ref}>{children}</div>;
}
