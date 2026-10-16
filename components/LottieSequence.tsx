"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem, LottiePlayer } from "lottie-web";

/**
 * Lottie clips played one after another, looping back to the first:
 * {% lottie title="…" %}{% clip src="/lottie/…/1.json" /%}…{% /lottie %}.
 * The player and the files load only as the sequence nears the screen, it
 * pauses while off screen, and the next clip is fetched while the current one
 * plays so the hand-off has no gap. Under reduced motion it shows the last
 * clip's final frame and stays still. Styles are `.lottie-sequence` in
 * globals.css.
 */
export function LottieSequence({
  srcs,
  title,
}: {
  srcs: string[];
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = ref.current;
    if (!holder || srcs.length === 0) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const files = new Map<string, Promise<object>>();
    const fetchClip = (src: string) => {
      if (!files.has(src)) {
        files.set(
          src,
          fetch(src).then((r) => r.json() as Promise<object>),
        );
      }
      return files.get(src)!;
    };

    let lottie: LottiePlayer | null = null;
    let current: { anim: AnimationItem; layer: HTMLDivElement } | null = null;
    let visible = false;
    let cancelled = false;

    const play = async (index: number) => {
      const data = await fetchClip(srcs[index]);
      if (cancelled || !lottie) return;

      // Each clip draws into its own layer; the outgoing one is removed only
      // once the incoming one has drawn, so the swap never shows a blank.
      const layer = document.createElement("div");
      layer.className = "lottie-sequence-layer";
      holder.appendChild(layer);
      const anim = lottie.loadAnimation({
        container: layer,
        renderer: "svg",
        loop: false,
        autoplay: false,
        // Lottie annotates the data it is given, so every play gets a copy.
        animationData: structuredClone(data),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });

      anim.addEventListener("DOMLoaded", () => {
        const previous = current;
        current = { anim, layer };
        previous?.anim.destroy();
        previous?.layer.remove();
        if (reduced) {
          anim.goToAndStop(anim.totalFrames - 1, true);
          return;
        }
        if (visible) anim.play();
        void fetchClip(srcs[(index + 1) % srcs.length]);
      });

      if (!reduced) {
        anim.addEventListener("complete", () => {
          void play((index + 1) % srcs.length);
        });
      }
    };

    const start = async () => {
      const mod = await import("lottie-web/build/player/lottie_light");
      if (cancelled) return;
      lottie = mod.default;
      void play(reduced ? srcs.length - 1 : 0);
    };

    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !started) {
          started = true;
          void start();
        }
        if (!current || reduced) return;
        if (visible) current.anim.play();
        else current.anim.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(holder);

    return () => {
      cancelled = true;
      observer.disconnect();
      current?.anim.destroy();
      holder.replaceChildren();
    };
  }, [srcs]);

  return (
    <div
      ref={ref}
      className="lottie-sequence"
      role="img"
      aria-label={title || "Animation"}
    />
  );
}
