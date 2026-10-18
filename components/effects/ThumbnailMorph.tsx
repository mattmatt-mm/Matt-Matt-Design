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
 */

const NAME = "case-thumb";
/** Give up waiting for the new page after this long and let it fade in. */
const WAIT_MS = 1500;

function thumbnailOf(slug: string) {
  const entry = document.querySelector(`[data-chain-entry="${CSS.escape(slug)}"]`);
  // The first image before the entry's first section heading.
  return entry?.querySelector<HTMLImageElement>(".prose > :not(h2 ~ *) img") ?? null;
}

// Rendering is paused while the transition waits for the new page, so no
// animation frame fires until it is done: poll on a timer instead.
function tick() {
  return new Promise<void>((resolve) => setTimeout(resolve, 16));
}

async function waitForThumbnail(slug: string) {
  const until = performance.now() + WAIT_MS;
  while (performance.now() < until) {
    // Once the entry exists the page has rendered: an entry with no image
    // thumbnail will never grow one, so stop looking.
    if (document.querySelector(`[data-chain-entry="${CSS.escape(slug)}"]`)) {
      return thumbnailOf(slug);
    }
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
      const source = link?.querySelector("img");
      const slug = link?.dataset.morph;
      if (!link || !source || !slug) return;

      // Take the click from next/link, which skips a prevented event.
      event.preventDefault();
      const href = link.getAttribute("href")!;
      source.style.viewTransitionName = NAME;

      let target: HTMLImageElement | null = null;
      const transition = document.startViewTransition(async () => {
        router.push(href);
        target = await waitForThumbnail(slug);
        if (target) {
          // A lazy image may not have loaded yet; the morph should land on
          // pixels, not an empty box.
          target.loading = "eager";
          await Promise.race([
            target.decode().catch(() => {}),
            new Promise((resolve) => setTimeout(resolve, WAIT_MS)),
          ]);
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
