import { defaultStyle, duration } from "distortion-waves";

export const gradientWave = {
  type: "vertical",
  palette: "colorful",
  live: false,
  prewarm: false,
  resolution: 1,
} as const;

export const pullCardWaveStyle = {
  ...defaultStyle("vertical"),
  anticipation: 0.42,
  travel: 1.8,
  particleLife: 1.2,
  gatherGlow: 0.85,
  pull: 32,
  rimStrength: 0,
  rimFade: 0,
  hairlineWidth: 0,
  hairlineFade: 0,
};

export const pullCardWaveDuration = duration(pullCardWaveStyle);

export function scrubForPull(progress: number) {
  // Hold just before the wave opens, with room for a longer pull.
  const limit = (pullCardWaveStyle.anticipation - 0.015) / pullCardWaveDuration;
  const heldExtent = 0.28;
  return limit * (1 - (1 - heldExtent) * Math.exp(-2 * progress));
}

export const GRADIENT_FEATHER = 160;
export const gradientWipe = {
  duration: 600,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  fill: "forwards",
} as const;

export function wipeGradientSheet(sheet: HTMLElement, delay = 0) {
  return sheet.animate(
    { maskPosition: ["0 0%", "0 100%"], WebkitMaskPosition: ["0 0%", "0 100%"] } as PropertyIndexedKeyframes,
    { ...gradientWipe, delay },
  );
}
