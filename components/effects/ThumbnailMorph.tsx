"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Opening a case study from the home gallery morphs the card's picture into
 * the case study's thumbnail — the image set before its first `##` heading.
 * The browser's View Transitions API does the travel: the card is captured,
 * the route changes, and once the thumbnail is on screen and decoded the two
 * are paired under one name. A case study that opens on a video or Lottie
 * has no image to land on and simply navigates. No API, reduced motion, or a
 * modified click (new tab, new window) also navigate as normal.
 * See doc/thumbnail-morph-plan.md.
 *
 * A Fun tile (`data-morph="fun:<slug>"`) travels the same way into its
 * piece's page, where it lands on the picture or the looping video
 * (doc/fun-tab-plan.md).
 */

const NAME = "case-thumb";
/** Give up waiting for the new page after this long and let it fade in. */
const WAIT_MS = 1500;

/** The page's landing element once it has rendered, null if it has none. */
function landingOf(key: string): HTMLElement | null | undefined {
  if (key.startsWith("fun:")) {
    const hero = document.querySelector(`[data-fun-hero="${CSS.escape(key.slice(4))}"]`);
    return hero ? hero.querySelector<HTMLElement>("img, video") : undefined;
  }
  const entry = document.querySelector(`[data-chain-entry="${CSS.escape(key)}"]`);
  // The first image before the entry's first section heading.
  return entry
    ? entry.querySelector<HTMLImageElement>(".prose > :not(h2 ~ *) img")
    : undefined;
}

// Rendering is paused while the transition waits for the new page, so no
// animation frame fires until it is done: poll on a timer instead.
function tick() {
  return new Promise<void>((resolve) => setTimeout(resolve, 16));
}

async function waitForLanding(key: string) {
  const until = performance.now() + WAIT_MS;
  while (performance.now() < until) {
    // Once the entry exists the page has rendered: an entry with no image
    // thumbnail will never grow one, so stop looking.
    const landing = landingOf(key);
    if (landing !== undefined) return landing;
    await tick();
  }
  return null;
}

export function ThumbnailMorph() {
  const router = useRouter();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !document.startViewTransition ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[data-morph]",
      );
      const source = link?.querySelector<HTMLElement>("img, video");
      const slug = link?.dataset.morph;
      if (!link || !source || !slug) return;

      // Take the click from next/link, which skips a prevented event.
      event.preventDefault();
      const href = link.getAttribute("href")!;
      source.style.viewTransitionName = NAME;

      let target: HTMLElement | null = null;
      const transition = document.startViewTransition(async () => {
        router.push(href);
        target = await waitForLanding(slug);
        if (target instanceof HTMLImageElement) {
          // A lazy image may not have loaded yet; the morph should land on
          // pixels, not an empty box.
          target.loading = "eager";
          await Promise.race([
            target.decode().catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, WAIT_MS)),
          ]);
        }
        if (target) {
          target.style.viewTransitionName = NAME;
        }
        // Let the router's scroll to the top land before the new capture.
        await tick();
      });
      transition.finished.finally(() => {
        source.style.viewTransitionName = "";
        if (target) target.style.viewTransitionName = "";
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return null;
}
