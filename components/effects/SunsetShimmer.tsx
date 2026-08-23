"use client";

import {
  GradientShimmer,
  type GradientStop,
} from "gradient-shimmer";

const SUNSET_GRADIENT = [
  { color: "var(--color-shimmer-sunset-coral)", position: 0 },
  { color: "var(--color-shimmer-sunset-orange)", position: 0.25 },
  { color: "var(--color-shimmer-sunset-gold)", position: 0.5 },
  { color: "var(--color-shimmer-sunset-rose)", position: 0.75 },
  { color: "var(--color-shimmer-sunset-red)", position: 1 },
] satisfies GradientStop[];

export function SunsetShimmer({
  children,
  pauseBetween,
}: {
  children: string;
  pauseBetween: number;
}) {
  return (
    <GradientShimmer
      gradient={SUNSET_GRADIENT}
      pauseBetween={pauseBetween}
      pauseOnScroll={false}
      pauseWhenOffscreen={false}
      style={{ display: "inline" }}
    >
      {children}
    </GradientShimmer>
  );
}
