"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type Zoomed = { img: HTMLImageElement; src: string; alt: string };

/** Gap kept between the zoomed image and the window edge, as the page gutter. */
const EDGE = 24;

function motion() {
  const root = getComputedStyle(document.documentElement);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    duration: reduced ? 0 : parseFloat(root.getPropertyValue("--ai-open-dur")),
    easing: root.getPropertyValue("--ai-ease").trim() || "ease-out",
  };
}

/** Where the zoomed image rests: as large as the window allows, never past its own pixels. */
function restingRect(img: HTMLImageElement) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const scale = Math.min(
    (window.innerWidth - EDGE * 2) / w,
    (window.innerHeight - EDGE * 2) / h,
    1,
  );
  const width = w * scale;
  const height = h * scale;
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

/** The transform that puts the resting image back over the one in the page. */
function fromPage(img: HTMLImageElement, rest: ReturnType<typeof restingRect>) {
  const r = img.getBoundingClientRect();
  return `translate(${r.left - rest.left}px, ${r.top - rest.top}px) scale(${r.width / rest.width})`;
}

/**
 * Case-study and post images open larger on click, Enter or Space. The image
 * travels from its place in the page to the centre of the window while the
 * page dims behind it, and travels back on close — one image moving, not a
 * second one appearing. Click anywhere or press Escape to close. The cursor
 * reads "Zoom" over an image and "Close" over the open view. Prose marks the
 * images (`data-zoom`); styles are `.image-zoom` in globals.css.
 */
export function ImageZoom() {
  const [zoomed, setZoomed] = useState<Zoomed | null>(null);
  const [rest, setRest] = useState<ReturnType<typeof restingRect> | null>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    const open = (img: HTMLImageElement) => {
      if (img.closest("a")) return;
      closing.current = false;
      setRest(restingRect(img));
      setZoomed({ img, src: img.currentSrc || img.src, alt: img.alt });
    };

    const target = (e: Event) =>
      (e.target as Element | null)?.closest<HTMLImageElement>("img[data-zoom]");

    const onClick = (e: MouseEvent) => {
      const img = target(e);
      if (img) open(img);
    };

    const onKey = (e: KeyboardEvent) => {
      const img = target(e);
      if (img && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        open(img);
      }
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Opening: the page image hides, its stand-in starts exactly over it and
  // travels to rest.
  useLayoutEffect(() => {
    if (!zoomed || !rest || !picture.current || !backdrop.current) return;
    const { duration, easing } = motion();
    zoomed.img.style.visibility = "hidden";
    document.documentElement.style.overflow = "hidden";
    picture.current.animate(
      [{ transform: fromPage(zoomed.img, rest) }, { transform: "none" }],
      { duration, easing },
    );
    backdrop.current.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration,
      easing,
    });
    close.current?.focus({ preventScroll: true });
  }, [zoomed, rest]);

  const dismiss = useCallback(() => {
    if (!zoomed || !rest || closing.current) return;
    closing.current = true;
    const { duration, easing } = motion();
    const done = () => {
      zoomed.img.style.visibility = "";
      document.documentElement.style.overflow = "";
      zoomed.img.focus({ preventScroll: true });
      setZoomed(null);
      setRest(null);
      // Once the view has unmounted, let the view cursor look again at what
      // is now under the pointer.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => window.dispatchEvent(new Event("scroll"))),
      );
    };
    backdrop.current?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration,
      easing,
      fill: "forwards",
    });
    const travel = picture.current?.animate(
      [{ transform: "none" }, { transform: fromPage(zoomed.img, rest) }],
      { duration, easing, fill: "forwards" },
    );
    if (travel && duration > 0) travel.onfinish = done;
    else done();
  }, [zoomed, rest]);

  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    // The resting size depends on the window; a resize simply closes.
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", dismiss);
    };
  }, [zoomed, dismiss]);

  if (!zoomed || !rest) return null;

  return (
    <div
      className="image-zoom"
      role="dialog"
      aria-modal="true"
      aria-label={zoomed.alt || "Image"}
      data-cursor="Close"
      onClick={dismiss}
    >
      <div ref={backdrop} className="image-zoom-backdrop" />
      {/* eslint-disable-next-line @next/next/no-img-element -- the same file
          the page already loaded, shown larger */}
      <img
        ref={picture}
        src={zoomed.src}
        alt={zoomed.alt}
        className="image-zoom-picture"
        style={rest}
      />
      <button ref={close} type="button" className="sr-only" onClick={dismiss}>
        Close image
      </button>
    </div>
  );
}
