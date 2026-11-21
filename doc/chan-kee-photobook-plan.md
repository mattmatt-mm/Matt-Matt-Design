# 燦記路邊雞 photobook

Implemented on November 21, 2026.

## Placement

The photobook opens on its front cover at the top of the **燦記路邊雞** detail page. The reader fills the available Fun detail media column. The red poster is the gallery thumbnail. The project details sit beside the reader on wide screens and follow it on smaller screens.

## Reading

The supplied PDF has 22 A4 portrait pages. Show the front and back covers on their own. Pair the interior pages as 2–3, 4–5, through 20–21 so the artwork across the final spread joins correctly.

- **Desktop** shows a spread when the reader has enough width. Tap the right page to advance or the left page to go back. Previous and Next buttons and arrow keys also turn the spread.
- The front cover slides right toward the spine as it opens. The last spread folds into the centered back cover. The cover turns mirror these motions when reading backwards.
- **Phone** shows one page at a time. Tap the page or swipe horizontally to turn it. Vertical swipes scroll the site. Tap the page number to open the enlarged view for reading and panning.
- Drag the bottom-right corner forward, or the bottom-left corner of the left page back. The corner follows the pointer along a flat crease. Releasing a short drag returns the sheet to its starting position.
- Show the current page or range and the total beside the controls. Keep the reader's position when the viewport rotates or changes width. With reduced motion, change pages instantly. Keep focus on the active control and announce the page change to screen readers.

## Assets and implementation

The 22 WebP pages are stored at 1555 × 2200 pixels and total 5.36 MiB. The reader uses responsive sizes for the visible and adjacent pages and loads the full-size image for zoom. The optional **Photobook pages** field in Keystatic keeps the page images and descriptions in reading order.

## Reuse

Import `Photobook` from `@/components/photobook/Photobook`. Pass an ordered array of `{ src, alt, width, height }` page images, starting with the front cover and ending with the back cover. Use the same aspect ratio for the pages. The optional `id` is a deep-link anchor, and `label` names the reader for assistive technology.

```tsx
import { Photobook, type PhotobookPage } from "@/components/photobook/Photobook";

export function ProjectBook({ pages }: { pages: PhotobookPage[] }) {
  return <Photobook pages={pages} id="project-book" label="Project photobook" />;
}
```

## Verification

Verified in Chrome at desktop and emulated phone sizes. The checks covered navigation from both covers, the layout of pages 20–21, animation and reduced motion, keyboard controls, horizontal swipe, vertical scroll, zoom and pan, page position on rotation, and clearance above the floating dock. The initial desktop view requested the cover and its adjacent pages.
