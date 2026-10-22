# Fun tab

- Status: agreed with Matt, 2026-10-23 (interview in session)
- References: a hackathon/concept portfolio grid (4-column masonry, filter
  chips, title + muted subtitle) and a file-inspector view of one poster
  (palette dots left, the work centred, Resolution / Filename / Date right).
- Content: Matt's drop in `raw/Hobby/` (copied to `public/`, never linked).

## What it is

A fourth dock tab, **Fun** (Phosphor `Sparkle`), at `/fun`: side and fun work
as a masonry wall. A tile morphs into its own page, a file-inspector view of
the piece, and the dock contracts to the back arrow as on a case study.

## Decisions

| Question | Answer |
|---|---|
| Route and dock spot | `/fun`, third: Home · Writing · Fun · Profile. The bar becomes `4 × 60 + 8 = 248px`; nothing new, `--dock-count` already drives it. |
| Width | The grid **leaves the column**: `min(1200px, 100vw − 48px)` (840px at first; Matt widened it on 2026-10-23), centred on the 640px measure. Name, role and filter row stay in the column. |
| Intro | None on `/fun` (Matt, 2026-10-23): the page sits outside `(site)` with the Header alone, at the same position as on every tab. |
| Columns | 3 from 688px, 2 below it. Gap 24px (16px below 688px). |
| Filters | Text links, not chips: **All · Hackathon · Side project · Motion · Illustration**. Active in fg, others muted, 16/21, 16px apart, wrapping on a phone. Real links (`/fun?c=motion`); the grid filters on the client and the server ships All. A category with no pieces is not shown; with fewer than two categories in use there is no row at all. |
| Item | Title + muted subtitle under the tile (as the Home gallery). Media: an image, or a looping silent video with a still. A set holds **more images**, shown under the main one in the open view. |
| Order | Newest first by date. |
| Hover | The caption dims to 60%; the cursor becomes the dot labelled **View**. Tiles press to 0.98. |
| Sets | A piece with more images is a **stack** (Matt, 2026-10-23): its next two pictures sit behind the cover, each a step smaller, their top edges peeking 8px and 16px above it. Hover or keyboard focus fans them out, 16px and 5° to either side, on `--ai-open-dur` / `--ai-ease`; the tile lifts above its neighbours while fanned. A stacked tile's cover drops by its peek (8 or 16px), so the gap above it stays a full 24px. Transform only; no transition under reduced motion. The cover stays first in the markup, so the morph carries it. |
| Click | Always opens the piece's page, `/fun/<slug>`. The tile's picture (or video) travels into the page's hero through the existing thumbnail morph (View Transitions) while the rest cross-fades. The dock contracts to the back arrow, which steps back to the wall or links to `/fun`. Reduced motion: no travel. Matt first approved an overlay, then asked on 2026-10-23 for "a new page and the navigation turn into a back arrow just like in case study". |
| Palette | Up to four dots, picked from the image at build time (sharp). A "Palette" field overrides it with typed hex colours. 32px circles with the navigation rim so a near-background colour still shows its edge. |
| Details | Title (fg) and subtitle (muted); then label in fg, value muted: **Resolution** (read from the file), **Date**, **Tools** (free line, optional). If the piece has a case study or website: a "View project" / "View website" link. Helvetica, 16/21 — no monospace. |
| Empty state | "Nothing here yet." in muted, where the grid would be. |

## Layout of a piece's page

- No masthead, after the reference: the work is the page. 60px top, 128px
  bottom, as every page.
- ≥ 1104px: three columns: palette · 48px · media · 48px · details, both side
  columns 192px so the media sits on the window's centre line (Matt saw it
  sit left with a 32px palette column); the dots stand against the media. Media rests as large as the window allows inside 60px top
  and bottom, never past its own pixels. Palette and details are sticky.
- Below that: media on top at full width inside the 24px gutter, then
  palette dots in a row, then the details.
- More images stack under the main one, 24px apart, at the same width.

## Content model — Keystatic `fun`

`content/fun/*.yaml`, newest first.

- `title` (slug) · `subtitle` · `category` (select) · `date`
- `image` — the picture, or the video's still (palette, resolution and layout
  all read it) · `video` (optional .mp4, plays silently on loop) · `alt`
- `more[]` — `{ image, alt }`
- `tools` · `palette` (optional hex list) · `project` (Experience
  relationship) · `externalUrl`

Images to `public/images/fun/`, videos to `public/videos/fun/`. Keep videos
under ~10MB (H.264, no audio).

## Masonry

Order must read left to right, newest first, so CSS columns (top to bottom)
are out. Items are dealt to the shortest column using each image's aspect
ratio plus a caption allowance, computed on the server for 3 and for 2
columns. Both layouts are rendered and one is `display: none` at each width,
so first paint is right without measuring; a hidden copy leaves the
accessibility tree and never loads its lazy images.

## Seed content (drafted by Claude — Matt to edit)

| Piece | Category | Media |
|---|---|---|
| BM Airline | Side project | video + 3 images |
| ISD graduation backdrop | Side project | 11 renders |
| ISD culture poster | Illustration | poster |
| 燦記 pattern | Illustration | poster |
| Innovation Design Tech crewneck | Side project | mockup |
| The HKUST | Illustration | card |

Titles, subtitles and dates are guesses except the poster's July 16.

## Touch points

`components/ai/AiDock.tsx` (tab, detail route, "Back to Fun"),
`components/PageSlide.tsx` (order), `components/effects/ThumbnailMorph.tsx`
(lands on `[data-fun-hero]`), `app/fun/page.tsx`,
`app/fun/[slug]/page.tsx`, `components/fun/*`, `lib/content.ts` (`getFun`,
palette), `lib/fun-categories.ts`, `keystatic.config.ts`, `app/sitemap.ts`,
`app/globals.css`.
