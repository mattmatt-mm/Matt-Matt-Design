"use client";

import { getSvgPath, type FigmaSquircleParams } from "figma-squircle";
import { useLayoutEffect, useRef, type RefObject } from "react";
import { SITE_SQUIRCLE_RADIUS, SITE_SQUIRCLE_SMOOTHING } from "@/components/SiteSquircle";
import { VideoPlayer } from "@/components/VideoPlayer";

type Corners = Pick<
  FigmaSquircleParams,
  | "topLeftCornerRadius"
  | "topRightCornerRadius"
  | "bottomRightCornerRadius"
  | "bottomLeftCornerRadius"
>;

/**
 * Clips an element to the site's squircle with a radius per corner, which
 * SiteSquircle cannot do: the tab has square bottom corners where it joins
 * the recording, and the recording a square top-left corner under the tab.
 * The CSS border-radius on each piece is the first-paint fallback.
 */
function useCornerClip<T extends HTMLElement>(corners: Corners) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      el.style.clipPath = `path('${getSvgPath({
        ...corners,
        cornerSmoothing: SITE_SQUIRCLE_SMOOTHING,
        width,
        height,
      })}')`;
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
    // The corners are constants at each call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref as RefObject<T>;
}

const R = SITE_SQUIRCLE_RADIUS;

/**
 * A screen recording filed like a folder: a very short caption on a tab at
 * its top-left, joined to the recording by an inside curve, and the
 * recording filling the full width beneath. Matt drew it on 2026-10-18 to
 * replace a padded backdrop frame that made the video too small. The tab is
 * the page's line grey with the text colour on it, so the caption reads in
 * both themes without measuring anything.
 */
export function Recording({
  caption,
  ...video
}: {
  caption: string;
  src: string;
  poster?: string;
  title?: string;
}) {
  const tabRef = useCornerClip<HTMLElement>({
    topLeftCornerRadius: R,
    topRightCornerRadius: R,
    bottomRightCornerRadius: 0,
    bottomLeftCornerRadius: 0,
  });
  const bodyRef = useCornerClip<HTMLDivElement>({
    topLeftCornerRadius: 0,
    topRightCornerRadius: R,
    bottomRightCornerRadius: R,
    bottomLeftCornerRadius: R,
  });

  return (
    <figure className="recording">
      <div className="recording-tab-row">
        <figcaption ref={tabRef} className="recording-tab">
          {caption}
        </figcaption>
        {/* The inside curve where the tab meets the recording's top edge. */}
        <span className="recording-fillet" aria-hidden />
      </div>
      <div ref={bodyRef} className="recording-body">
        <VideoPlayer {...video} flush />
      </div>
    </figure>
  );
}
