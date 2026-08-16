import localFont from "next/font/local";

/**
 * Geist Pixel — Latin only, single weight (400). The package ships no CJK
 * glyphs, so Chinese characters fall through per-glyph to the CJK faces
 * listed in --font-pixel (app/globals.css).
 */
export const geistPixel = localFont({
  src: "../node_modules/@fontsource/geist-pixel/files/geist-pixel-latin-400-normal.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-geist-pixel",
  display: "swap",
  adjustFontFallback: false,
  // No fallback list here on purpose: next/font would splice a generic
  // `monospace` into the middle of the chain, ahead of the CJK faces.
  // The full, deterministic chain lives in --font-pixel (app/globals.css).
});
