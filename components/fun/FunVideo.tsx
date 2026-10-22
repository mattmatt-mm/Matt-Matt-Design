"use client";

import { type ComponentPropsWithoutRef, useEffect, useRef } from "react";

/**
 * A silent loop that plays only while it is on screen, and not at all under
 * reduced motion, where the still stands in for it. A copy in the hidden
 * masonry layout never intersects, so it never loads past its poster.
 */
export function FunVideo(props: ComponentPropsWithoutRef<"video">) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void video.play().catch(() => {});
      else video.pause();
    });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return <video ref={ref} muted loop playsInline preload="none" {...props} />;
}
