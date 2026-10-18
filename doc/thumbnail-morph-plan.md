# Gallery card to case-study thumbnail morph

- Status: built
- Requested: 2026-10-18

Matt asked for the Hermes Task home card to morph into the case study's
thumbnail when it is opened.

## Decisions

- The View Transitions API does the travel, driven by
  `components/effects/ThumbnailMorph.tsx` (mounted in `app/layout.tsx`). No
  animation library, no React experimental flag.
- Every gallery card that opens a case study carries `data-morph="<slug>"`.
  On a plain left click the card's image is named `case-thumb`, the route is
  pushed, and once the entry's thumbnail — the first image before its first
  `##` — is rendered and decoded it takes the same name. Names are cleared
  when the transition ends, so the continuous detail chain never holds two.
- Timing is the image zoom's: `--ai-open-dur` on `--ai-ease`. The rest of the
  page cross-fades on the same duration.
- A case study that opens on a video or Lottie has no image to land on and
  only cross-fades. No API, reduced motion, and modified clicks navigate
  normally.
- Rendering is paused while the transition waits for the new page, so the
  wait polls on a timer, never `requestAnimationFrame` — a frame-based wait
  hangs until the browser abandons the transition.
- Forward only. Going back from a case study does not morph.

## Content

Hermes Task now opens on Matt's cobalt thumbnail
(`public/images/experience/hermes-task/image.webp`, also the home card and
social cover); the demo video moved into Overview. Incipe's card and
thumbnail are the same picture. Other case studies open on a different crop
of their card, so theirs morph between two framings.
