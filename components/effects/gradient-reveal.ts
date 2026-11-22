export const gradientWave = {
  type: "vertical",
  palette: "colorful",
  live: false,
  prewarm: false,
  resolution: 1,
} as const;

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
