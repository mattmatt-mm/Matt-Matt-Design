# Dock contracts into a back button

- Status: built
- Requested: 2026-10-16

## Goal

On a detail page the bottom navigation used to light the Experience tab, as if
the visitor were still on the list. Instead, the bar contracts like Apple's
Dynamic Island into a single circle holding a back arrow, beside the AI
trigger. Leaving the detail page expands it back into the three tabs.

## Decisions

- Detail pages are `/work/<slug>` and `/writing/<slug>`. The arrow goes back
  to the page the visitor came from — the gallery, a list, wherever — as a
  real history step, so that page's scroll position is restored. (Revised
  2026-10-16: it first always went to the list, which sent gallery visitors
  home.)
- A history step is used only when the detail page was just pushed from one
  of the site's own pages. When it was opened directly (a shared link) or
  reached with the browser's own back/forward, the entry behind it may not be
  the site's, so the arrow links to the list the page belongs to instead:
  Experience (`/`) for case studies, `/writing` for posts. Scrolling on into
  the next entry of the tour does not change where the arrow goes.
- Its screen-reader label is "Back" when it steps back, and "Back to
  Experience" / "Back to Writing" when it links to the list.
- The contracted bar is `--dock-h` wide, so the 188×48 capsule becomes a 48×48
  circle, the same size as the AI trigger. The row stays centred and the 8px gap
  holds, so the pair reads as two matching circles.
- One morph, on the shared open timing (300ms, `--ai-ease`). The row's width
  animates and the bar follows it. Tabs and the recess pill fade out with up to
  3px blur as the columns close in, and the arrow resolves from 3px blur at the
  centre, so the content cross-fades inside a surface that changes shape —
  the Dynamic Island move.
- Animating width is allowed here because the bar is a capsule drawn with
  `border-radius`, not a squircle clip path, so no corner regenerates per
  frame.
- The route is known during render, so a detail page is served already
  contracted. Only navigation animates.
- The back arrow is a real link with an `sr-only` label, takes the tab tap
  sound and hop, and presses like other targets. Hidden tabs leave the tab
  order.
- Reduced motion swaps states without the morph.
