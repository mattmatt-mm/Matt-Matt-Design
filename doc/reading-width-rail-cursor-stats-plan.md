# Reading width, section rail, view cursor and stats block

Requested by Matt on 2026-10-17, from annotated screenshots of a reference
portfolio. He asked for the reference's structure, not its look: no serif
display type, no illustration-heavy diagrams. Everything below is drawn in the
site's own 16/21 type, tokens and hairlines.

## 1. Column: 500px → 640px everywhere

Matt chose a 640px maximum for **all** content, not only detail pages.

- `--container-column` becomes `640px`. The header, intro, lists, gallery and
  detail pages all share it, so the masthead still does not move between tabs.
- The gutter breakpoint moves with it. The column needs 24px either side until
  the viewport can hold 640px plus both gutters, so gutters drop at **688px**
  (`--breakpoint-column`), not 640px.
- Gallery images fill the wider column at their own aspect ratio (a 5:3 image is
  now 640×384) and carry `sizes` so retina screens get a sharp file.
- A case study's thumbnail (anything before the first `##`) is
  `min(840px, 100vw - 48px)`; images, video and Lottie inside a section are the
  text's 640px. (Matt went 1200 → 680 → this split on 2026-10-17.)
- At 1280px the column now starts at x=320. `CLAUDE.md` measurements are updated.

## 2. Section rail (detail pages)

A quiet table of contents to the left of the column on `/work/*` and
`/writing/*`, listing the current entry's `##` headings.

- Text only, 16/21. Sections are `--color-muted`; the one being read is
  `--color-fg`. Colour changes on the site's 120ms ease-out. No markers, no box.
- Fixed to the screen's left edge (24px in), vertically centred, 160px wide.
  Shown only from 1104px, where it clears the 640px text by 48px, and when
  the entry has at least two sections.
- Follows `DetailChain`: once the next entry's gate opens, the rail lists that
  entry's sections.
- The section being read is the last heading whose top has crossed 30% of the
  viewport height; before any has, the first is current.
- Links are ordinary in-page anchors. Headings get stable ids from their text.

## 3. View cursor

The normal cursor stays everywhere. Over a project target it becomes a dot with
a floating "View project" label.

- Targets: gallery images that link somewhere, and Experience rows that link
  somewhere (`data-cursor="view"`). Writing rows keep the normal pointer.
- Only for a fine pointer that can hover. Touch screens never see it.
- Dot: 8px circle in `--color-fg`. Label: 16/21 text on a floating squircle
  surface (`SiteSquircle`, 16px / 0.6, `--filter-elevated`), 12px right of the
  dot.
- Enters and leaves with the site's 3px blur + fade over 160ms. Follows the
  pointer exactly, with no lag. Reduced motion: it appears and disappears
  without the blur fade.
- Decorative and `aria-hidden`. Links keep their own accessible names and focus
  rings.

### Labels and image zoom (added 2026-10-17)

- A target that leaves the site reads "View website"; a case study reads
  "View project".
- Case-study and post images zoom. The cursor reads "Zoom" over them and
  "Close" over the open view. Click, Enter or Space opens; clicking anywhere or
  Escape closes. The image itself travels from the page to the window centre
  and back (`--ai-open-dur`, `--ai-ease`), the source hidden meanwhile, so it
  reads as one image moving. It rests as large as the window allows inside the
  24px gutter, never past its own pixels. The page behind dims to
  `--color-content-mask-solid`. Scrolling is locked while open, focus moves to
  a hidden "Close image" button and returns to the image on close. A resize
  closes it.

## 4. Stats block

A Keystatic block for case studies and posts: two to four figures in a row.

- Markdoc: `{% stats %}{% stat value="US$48K" label="revenue in three months" /%}…{% /stats %}`.
- Value in `--color-fg`, label in `--color-muted` beneath it, both 16/21:
  hierarchy from colour and position, never size.
- Equal columns at 640px and above, stacked below it.
- Keystatic: `stats` is a `repeating` component whose children are `stat` blocks.

## Not doing

- The explainer step diagram and the principles block: Matt chose Stats first.
- Any serif heading or larger type from the reference.

## 5. Lottie thumbnail and project dates (added 2026-10-17)

- Kedonia's thumbnail is its four Lottie clips (Generate, Review, Confirm,
  Done) played in order and looped, via `{% lottie %}` / `{% clip %}`
  (components/LottieSequence.tsx, `lottie-web` light build, imported on
  demand). Each clip draws into its own layer; the outgoing layer is removed
  once the incoming one has drawn. The next clip is fetched while the current
  one plays. Paused off screen; reduced motion holds the last frame of Done.
- Embedded PNGs in the exports were re-encoded to WebP (3.9MB → 670KB).
- Experience entries gain optional `start` and `end` text fields. A case-study
  page prints them under the title as two Stats figures, "Start" and "End".
  Neardeal and Bowtie & JP Health have no dates yet.
