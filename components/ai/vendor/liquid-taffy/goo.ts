/*
 * Adapted from arknow91/liquid-taffy (MIT).
 * The blur and alpha thresholds are a calibrated unit: changing one without
 * the other makes the liquid rim swell during motion.
 */

import gsap from "gsap";

export const GOO_RIM_THRESHOLDS: Record<
  number,
  readonly [outer: number, inner: number]
> = {
  1: [-14.5146, -24.6721],
  4: [-12.25, -14.25],
  5: [-12.7296, -15.063],
  7: [-11.6925, -13.245],
};

export function gooThreshold(offset: number) {
  return `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 ${offset}`;
}

export interface GooFilterElements {
  blur: SVGFEGaussianBlurElement | null;
  rim: SVGFEColorMatrixElement | null;
  inner: SVGFEColorMatrixElement | null;
}

export function setGooBlur(
  elements: GooFilterElements,
  blur: number,
  timeline?: gsap.core.Timeline,
  at = 0,
) {
  const [outer, inner] = GOO_RIM_THRESHOLDS[blur];
  const steps: [Element | null, gsap.TweenVars][] = [
    [elements.blur, { attr: { stdDeviation: blur } }],
    [elements.rim, { attr: { values: gooThreshold(outer) } }],
    [elements.inner, { attr: { values: gooThreshold(inner) } }],
  ];

  for (const [target, variables] of steps) {
    if (timeline) timeline.set(target, variables, at);
    else gsap.set(target, variables);
  }
}
