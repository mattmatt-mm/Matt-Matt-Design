"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useId, useLayoutEffect, useRef } from "react";
import {
  GOO_RIM_THRESHOLDS,
  gooThreshold,
  setGooBlur,
} from "@/components/ai/vendor/liquid-taffy/goo";
import {
  HOUSE_SPRING_POINTS,
  springEase,
} from "@/components/ai/vendor/liquid-taffy/springs";
import { squirclePath } from "@/components/ai/vendor/liquid-taffy/squircle";

gsap.registerPlugin(CustomEase);

const SPRING = springEase("mattAiTaffySpring", HOUSE_SPRING_POINTS);
const PANEL_PATH = squirclePath(27.5, 41, 345, 96, 16);
const TRIGGER_PATH = squirclePath(296, 138, 52, 52, 16);
const PANEL_ORIGIN = { x: 200, y: 137 };
const TRIGGER_ORIGIN = { x: 322, y: 164 };
const PANEL_REST_SCALE = 0.11;
const ACTIVE_BLUR = 4;
const REST_BLUR = 1;

/**
 * The AI opening bridge is a focused adaptation of liquid-taffy's morphing
 * dropdown. It keeps that project's calibrated blur/rim pair, two-layer
 * handoff, and sampled spring, while substituting Matt's 52px trigger and
 * 345×96 composer geometry.
 */
export function AiTaffyOpen({ onSettled }: { onSettled: () => void }) {
  const rawId = useId().replace(/:/g, "");
  const filterId = `ai-taffy-${rawId}`;
  const svg = useRef<SVGSVGElement>(null);
  const trigger = useRef<SVGPathElement>(null);
  const panel = useRef<SVGPathElement>(null);
  const blur = useRef<SVGFEGaussianBlurElement>(null);
  const rim = useRef<SVGFEColorMatrixElement>(null);
  const inner = useRef<SVGFEColorMatrixElement>(null);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      queueMicrotask(onSettled);
      return;
    }

    const elements = { blur: blur.current, rim: rim.current, inner: inner.current };
    const timeline = gsap.timeline({
      onComplete: onSettled,
      defaults: { overwrite: "auto" },
    });

    gsap.set(svg.current, { autoAlpha: 1 });
    gsap.set(trigger.current, {
      transformOrigin: `${TRIGGER_ORIGIN.x}px ${TRIGGER_ORIGIN.y}px`,
    });
    gsap.set(panel.current, {
      scale: PANEL_REST_SCALE,
      x: TRIGGER_ORIGIN.x - PANEL_ORIGIN.x,
      y: TRIGGER_ORIGIN.y - PANEL_ORIGIN.y,
      rotation: -2,
      transformOrigin: `${PANEL_ORIGIN.x}px ${PANEL_ORIGIN.y}px`,
    });
    setGooBlur(elements, ACTIVE_BLUR);

    timeline
      .to(
        trigger.current,
        {
          x: PANEL_ORIGIN.x - TRIGGER_ORIGIN.x,
          scaleX: 1.08,
          scaleY: 0.94,
          duration: 0.52,
          ease: SPRING,
        },
        0,
      )
      .to(
        panel.current,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: SPRING,
        },
        0.035,
      )
      .to(
        trigger.current,
        {
          scale: 0,
          duration: 0.22,
          ease: "power3.out",
        },
        0.4,
      )
      .add(() => setGooBlur(elements, REST_BLUR), 0.54)
      .to(svg.current, { autoAlpha: 0, duration: 0.1, ease: "power2.out" }, 0.56);

    return () => {
      timeline.kill();
    };
  }, [onSettled]);

  return (
    <div className="ai-taffy-open" aria-hidden="true">
      <svg
        ref={svg}
        className="ai-taffy-open-svg"
        viewBox="0 0 400 190"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter
            id={filterId}
            filterUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="400"
            height="190"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur
              ref={blur}
              in="SourceGraphic"
              stdDeviation={REST_BLUR}
              result="blur"
            />
            <feColorMatrix
              ref={rim}
              in="blur"
              type="matrix"
              values={gooThreshold(GOO_RIM_THRESHOLDS[REST_BLUR][0])}
              result="goo"
            />
            <feColorMatrix
              ref={inner}
              in="blur"
              type="matrix"
              values={gooThreshold(GOO_RIM_THRESHOLDS[REST_BLUR][1])}
              result="inner"
            />
            <feFlood
              floodColor="var(--color-fg)"
              floodOpacity="0.25"
              result="rimColor"
            />
            <feComposite in="rimColor" in2="goo" operator="in" result="rimFull" />
            <feMerge>
              <feMergeNode in="rimFull" />
              <feMergeNode in="inner" />
            </feMerge>
          </filter>
        </defs>
        <g filter={`url(#${filterId})`} fill="var(--color-surface)">
          <path ref={trigger} d={TRIGGER_PATH} />
          <path ref={panel} d={PANEL_PATH} />
        </g>
      </svg>
    </div>
  );
}
