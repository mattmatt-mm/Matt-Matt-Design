"use client";

import { Squircle, type SquircleProps } from "@squircle-js/react";
import type { ComponentPropsWithoutRef, ReactElement } from "react";

export const SITE_SQUIRCLE_SMOOTHING = 0.6;
export const SITE_SQUIRCLE_RADIUS = 16;
const THUMBNAIL_SQUIRCLE_RADIUS = 4;

type SiteSquircleProps = SquircleProps & ComponentPropsWithoutRef<"div">;

/**
 * Shared Figma-style corner geometry for every non-circular rounded surface.
 * The library keeps the path in sync through ResizeObserver; border-radius is
 * retained as its no-JavaScript and first-render fallback.
 */
export function SiteSquircle({
  cornerRadius = SITE_SQUIRCLE_RADIUS,
  cornerSmoothing = SITE_SQUIRCLE_SMOOTHING,
  ...props
}: SiteSquircleProps) {
  return (
    <Squircle
      cornerRadius={cornerRadius}
      cornerSmoothing={cornerSmoothing}
      {...props}
    />
  );
}

export function ThumbnailSquircle({ children }: { children: ReactElement }) {
  return (
    <SiteSquircle asChild cornerRadius={THUMBNAIL_SQUIRCLE_RADIUS}>
      {children}
    </SiteSquircle>
  );
}
