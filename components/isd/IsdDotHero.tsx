"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildScene,
  drawScene,
  LOGO_FRAME,
  type LogoData,
  type Palette,
  type RoomsData,
  type Scene,
} from "./scene";

const MAX_DPR = 2;

/**
 * The ISD dot story on a canvas (doc/isd-dot-hero-plan.md). Without `time`
 * it plays itself while at least half of it is on screen and pauses
 * otherwise; under reduced motion it rests on the finished logo. With `time`
 * it shows that exact frame, for the review page's scrubber.
 */
export function IsdDotHero({
  time,
  label = "The ISD dot: one dot divides into a matrix that becomes a world map, two colliding ripples, a team circling and a team sprinting, then the ISD logo",
}: {
  time?: number;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const size = useRef({ width: 0, height: 0, dpr: 1 });
  const palette = useRef<Palette | null>(null);
  const draw = useRef<(t: number) => void>(() => {});

  // The data (about 11 KB gzipped) loads only once the hero is within a
  // screen of being seen, so a case study further down the chain costs
  // nothing until it is nearly reached.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        fetch("/isd/hero.json")
          .then((r) => r.json() as Promise<{ logo: LogoData; rooms: RoomsData }>)
          .then(({ logo, rooms }) => alive && setScene(buildScene(logo, rooms)));
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(canvas);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  // Size the backing store to the box, at up to 2× density.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const styles = getComputedStyle(canvas);
    palette.current = {
      dot: styles.getPropertyValue("--color-isd-orange").trim() || "#fcb041",
      ground: styles.getPropertyValue("--color-isd-cream").trim() || "#fcfaf6",
      font: getComputedStyle(document.body).fontFamily,
    };
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      size.current = { width, height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const observer = new ResizeObserver(() => {
      resize();
      draw.current(lastTime.current);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const lastTime = useRef(0);
  draw.current = (t: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !scene || !palette.current) return;
    lastTime.current = t;
    const { width, height, dpr } = size.current;
    drawScene(ctx, scene, t, width, height, dpr, palette.current);
  };

  // Controlled: draw the frame asked for.
  useEffect(() => {
    if (time !== undefined) draw.current(time);
  }, [time, scene]);

  // Uncontrolled: play while on screen.
  useEffect(() => {
    if (time !== undefined || !scene) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw.current(LOGO_FRAME);
      return;
    }
    let raf = 0;
    let clock = 0;
    let last = 0;
    const tick = (now: number) => {
      if (last) clock += Math.min(0.1, (now - last) / 1000);
      last = now;
      draw.current(clock);
      raf = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf);
        last = 0;
        if (entry.isIntersecting) raf = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    draw.current(0);
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [time, scene]);

  return <canvas ref={canvasRef} className="isd-dot-hero" role="img" aria-label={label} />;
}
