# Engraving graphics — illustration style specification

Matt's three references shared on 2026-10-19 define the visual target: an oak
sprig with acorns and a hanging spider, a grasshopper beside a search field,
and a leaping hare. Read this together with `doc/taste.md` §12 before adding
or drawing an illustration.

For the reusable still-to-sprite animation process, see
[`illustration-animation-workflow.md`](illustration-animation-workflow.md).

## Style in one sentence

**One-ink, hand-drawn natural-history ornaments with a woodcut character:
uneven expressive outlines, sparse hatch marks, open interiors, and a small
moment of wit within a spacious layout.**

“Engraving” is the project label, not a claim about how the reference artwork
was made. The screenshots show a rough, simplified print-like drawing style;
they do not establish a historical date, artist, or printing technique.
Dense, finely shaded Victorian plates are not the primary visual target.

## What to take from each reference

| Reference | Visible characteristics | Principle to carry forward |
|---|---|---|
| Oak sprig and spider | Slender irregular stem, lobed leaves, acorns, short interior marks, tiny hanging spider; sprig enters from the bottom edge beneath a large empty field | Use a tall organic silhouette as an edge ornament. A small secondary detail can add a quiet visual joke. |
| Grasshopper and search rule | Angular bent legs, long antennae, segmented body, a few wing marks; feet sit just above the right end of the horizontal rule | Let the drawing relate to an actual UI line. Keep the field label and input area clear. |
| Leaping hare | Stretched airborne pose, swept ears, uneven contour, short hatching around the belly and limbs; broad areas left unshaded | Suggest movement through silhouette and pose, without requiring animation or a ground line. |

## Drawing specifications

### Contour and mark-making

- **Pressure must change within a single continuous line** (Matt,
  2026-10-19): hairline entry, broader pressed sections, lifted thin sections,
  and a tapered exit. Different widths between separate lines alone are not
  enough. Match the overall pen weight across a set at the same display size.
  The Hermes motion sheets derive from the `*-pen-v3` redraws; earlier
  variants are retained as source history.

- Draw a confident but imperfect outline. Curves wander slightly, corners are
  organic, and the two sides of a form need not match.
- Vary line width within a stroke: swell, thin, taper, and occasionally leave
  a small break. The contour generally carries more weight than interior marks.
- Keep the irregularity purposeful. Avoid uniform vector strokes, mechanically
  rounded joins, repeated hatch patterns, and random jitter on every segment.
- Use small solid ink accents for an eye, a joint, or a deep crease. Keep the
  main body open so the surface behind it remains visible.
- At the intended display size, the outline should read first, the pose
  second, and the interior detail third. Judge weight at that size, not only
  while zoomed in; the screenshots do not establish an exact stroke width.

### Shading and detail

- Use a few short, uneven, mostly parallel hatch marks to suggest fur, folds,
  wings, leaf veins, or the underside of a body.
- Let marks follow the form. Group them locally; leave generous untouched
  areas between groups.
- Cross-hatching is optional and sparse. A dense mesh of lines, photographic
  tonal modelling, stipple covering the whole subject, or a dark silhouette
  loses the lightness of these references.
- No gradients, grey washes, blurred shadows, bevels, or paper texture baked
  into the artwork. Tone comes from the spacing of ink marks.

### Subjects and personality

- Prefer recognizable animals, insects, leaves, sprigs, acorns, and other
  small natural forms. Preserve defining anatomy without rendering every detail.
- Allow folk-art simplification, slightly exaggerated proportions, awkward
  charm, and lively poses. The hare is expressive rather than anatomically
  exact; the sprig and spider form a small scene within one ornament.
- Avoid glossy mascot styling, oversized cute eyes, emoji expressions,
  geometric icon construction, and polished stock-vector symmetry.
- Choose one dominant subject or coherent cluster. Do not add a landscape,
  illustrated frame, caption, or decorative background inside the asset.

## Colour, whitespace, and composition

The references pair black ink with flat sage green or vivid orange fields.
Those fields belong to the surrounding layout: the drawing has no white
sticker-shaped backing. Serif text, including italic text in the empty
state, adds an editorial character. These are reference observations, not a
request to change the portfolio's palette or typography.

For Matt-Matt-Design, keep the established page and foreground tokens (see
“Colour and theme” below). Carry across the more important relationship:
**a small dark drawing, a large quiet field, and typography that has room to
breathe.**

- Use asymmetry and deliberate placement rather than automatically centring
  every drawing in a box. A creature can occupy the end of a rule; a plant
  can enter from a page edge.
- Ground a standing subject on a real layout line where appropriate. Let an
  airborne subject remain airborne. The hare reference does not show a footer
  or a baseline, so do not infer one as a requirement.
- Keep the silhouette recognizable at a glance. Leave antennae, ears, legs,
  and leaf tips enough room; only crop where an edge entry is intentional.
- Keep ornaments subordinate to the content. They must not obscure text,
  controls, focus indicators, or interactive hit areas.
- Still images establish poses, not animation behaviour. Use the site's
  static ornament behaviour unless motion is explicitly requested.

## Reusable art brief

> Draw a small [subject] as a one-ink, hand-drawn woodcut-style ornament.
> Use a lively recognizable silhouette, irregular contours that swell and
> taper, and a few short hatch marks following the form. Leave most interiors
> open. Allow gentle asymmetry and playful natural-history character. Use
> solid ink only, with a transparent background, no scenery, no gradients,
> no dense tonal shading, and no polished geometric outlines. Compose it to
> [stand on a rule / enter from the bottom edge / leap through open space].
> Check that its pose and separate ink marks remain legible at [display size].

## In use

| File | Subject | Source | Where |
|---|---|---|---|
| `public/figures/404-tree-growth.gif` | Growing oak sapling, then a falling leaf | Original AI-generated sprite animation selected by Matt, 2026-10-19 | 404 page (`app/not-found.tsx`), 96–128px; final PNG frame under reduced motion |
| `public/figures/hermes/people-motion.webp` | Hands overwhelmed by contact cards | Original AI-generated ink illustration, 2026-10-19 | Hermes Task, People pile up |
| `public/figures/hermes/promises-motion.webp` | Follow-up note slipping below a handshake | Original AI-generated ink illustration, 2026-10-19 | Hermes Task, Promises slip |
| `public/figures/hermes/apps-motion.webp` | Tired person, closed laptop, phone message | Original AI-generated ink illustration, 2026-10-19 | Hermes Task, Apps wait to be opened |

The earlier `fiddler-crab.svg` remains available in the engraving registry but
is no longer used on the 404 page. The tree is a raster animation exception:
it uses an inline SVG ink filter with a reduced-motion still. Pale raster
fills become transparent, and the remaining ink uses `--color-fg` in both themes. Its source sprite sheet is in `output/imagegen/404-tree-growth-sprites.png`.

Add a row here for each new drawing. Register SVG ornaments in `ENGRAVINGS`
in `components/Engraving.tsx`; the animated tree uses its own SVG filter wrapper.

## Hermes Task illustrations

On 2026-10-19 Matt requested new graphics based on the meaning of the three
problem sections, explicitly excluding the earlier graphics as references.
The page now uses original generated ink illustrations rather than the older
geometric or programmatic engraved figures. Those older variants remain
available but are not the current Hermes Problem artwork.

These three animated explainers are allowed together in a point row; the one-ornament
limit below applies to decorative ornaments. Their source PNGs are in
`output/imagegen/hermes-problems/`; lossless runtime WebPs are in
`public/figures/hermes/`. They play once on entry through `components/InkSprite.tsx`, with CSS frame
stepping over a 3 × 3 sheet. The SVG filter removes pale source fills and
paints `--color-fg`. Reduced motion shows the final frame. The approved
static `*-pen-v3` files remain available.

## What it is for, and what it is not for

The style has two uses, built two ways.

**1. Ornament: sourced or original ink drawings.** A creature or sprig with wit,
either traced from a suitable public-domain plate or drawn originally to the
specification above. An old source alone does not make a drawing a style match;
prefer open, lightly hatched examples over densely rendered plates.

- Good uses: an empty state, the 404 page, the end of a case study or a post, a
  creature standing on a hairline (a tab bar rule, a divider, the composer's
  edge), or a quiet mark beside a footer line.
- At most **one traced engraving per screen**, and never more than one per
  section. Rarity is what keeps them charming.

**2. Explainers: engraved figures drawn in code.** Matt asked on 2026-10-19
for the Hermes Task problem figures in this style, so an idea can be drawn as
an engraving too. These are not traced. They are simple solids (spheres,
cubes, planks, a monitor, a speech bubble) shaded the way a plate shades them,
computed in `components/EngravedFigures.tsx` and used as `figure="…-engraved"`
in a **Drawn point row**:

- **Drawn by hand, never ruled.** Every line is a pen stroke from the
  `createPen` helper: it wavers off its course, overshoots a corner a little,
  swells in the middle and tapers to a point at each end, and runs heavier on
  the side in shadow. No two dashes or hatch lines are alike. Matt asked for
  this on 2026-10-19 after a first, machine-even version: the JW Anderson
  line is never one width. Strokes are thin filled outlines
  (`.pf-fill`, `.pf-fill-muted`, `.pf-fill-faint`), not SVG strokes, so the
  width can change along a line. The wobble is seeded, so a figure draws the
  same way every time.
- **Open, never filled.** Shapes are outlines on the paper. Nothing is a solid
  block of ink or a solid wall of cross-hatching, not even the emphasised
  one. What is kept or known is told by ink colour and a heavier contour, not
  by a fill (Matt, 2026-10-19).
- **Shadow is the only tone.** Light comes from the upper left. Hatching sits
  only where shade falls: the lower-right crescent of a sphere (crossed a
  second time on an inked one), the side of a box, the lower-right corner of
  its front, the inside of an outline's shadow edge. The lit side stays bare
  paper.
- Meaning still comes from the three tokens: fg for what is kept or known,
  muted for what is fading, the hairline colour for what has not arrived.
- Light falls across the ground as a few short level lines on the shadow side.
- Marks inside a shape (a message's lines, a dashboard's rows) are pen
  strokes like the rest.
- Same frame as every point figure: 192×120, standing on the 1px ground rule.
- Draw the real thing being compared, not a chart of it. Matt rejected rising
  bars for "Apps wait to be opened" because they read as growth; it is now a
  muted monitor showing a dashboard beside the inked message.
- No creatures or traced art inside a point. The objects are diagrams in
  engraved dress, so the idea stays as clear as the geometric version.
- Never use one as a gallery image, a case-study thumbnail, an icon, or inside
  the dock.
- The subject should fit the place where it appears without explaining it, the
  way the hare suggests speed and the grasshopper suggests "search" in the
  grass. Ask Matt for the subject if the brief doesn't give one.

## Sourcing

- **Never take JW Anderson's own crops or any brand's drawings.** They are that
  brand's identity, even if the originals are old.
- Use **verified public-domain** engravings (age alone is not verification): Biodiversity Heritage
  Library, Old Book Illustrations, Wikimedia Commons (check the licence on each
  file), the Internet Archive's scanned natural-history books. Or use art Matt
  drew or commissioned.
- Record the source in the SVG as a comment on the first line:
  `<!-- Source: <title>, <artist>, <year>, <URL>. Public domain. -->`
- Get the highest-resolution scan available, at least 2000px on the long side.
  Hatching falls apart if you trace a small JPEG.

## Preparing the file

Matt's raw scans arrive in `raw/` (a source drop, never referenced by the
site). Agents produce the finished SVG in `public/figures/`.

1. **Clean the scan.** Crop to the subject, remove paper texture and foxing,
   and threshold to pure black and white. Delete any background, ground line
   or caption printed with the plate: the site provides the ground.
2. **Trace** to a single filled path with `potrace` (`brew install potrace`) or
   Illustrator Image Trace (Black and White mode). Hatching must stay as
   separate strokes. If the trace has merged hatch lines into blobs, threshold
   or trace again rather than smoothing.
3. **Single colour.** Every shape is `fill="currentColor"` (or black, if the
   file is used as a mask, see below). No `stroke`, no `opacity`, no second
   colour, no `<image>`, no embedded raster.
   For dense hatching or stipple, threshold the full-size scan first, scale it
   down with a box filter to about 800px wide, then threshold again at a
   *dark* cut-off (around 90 of 255). A soft resize followed by a midpoint
   threshold fills the gaps between hatch lines and turns the drawing into a
   silhouette. Trace with `potrace -s --flat -t 3 -a 1 -O 0.8 -u 1`: `-u 1`
   rounds coordinates to whole pixels, which costs nothing visible at display
   size and keeps the file small.
4. **Clean the markup.** Run it through SVGO, or strip it by hand. Keep `viewBox`, remove
   `width`/`height`, and set the `viewBox` tight to the drawing with no
   padding, so placement is measured from the ink itself.
5. **Weight.** Aim for under 40KB *gzipped* per drawing (the server
   compresses SVG). Raw size runs about four times larger: the crab is 177KB
   raw and 38KB gzipped. A larger file usually means the trace kept noise or
   was traced bigger than it is ever shown. Simplify, but do not lose the
   hatching.
6. **Name** files after the subject, lowercase and hyphenated:
   `public/figures/hare.svg`, `public/figures/oak-sprig.svg`.

## Colour and theme

- **Dark-mode compatibility is required** (Matt, 2026-10-19). Leaf, trunk,
  and other open interiors must show the page background, with no white or
  cream fill. Render ink in `--color-fg`; simple raster inversion is not an
  acceptable substitute. Generated artwork needs an ink-only alpha treatment
  before display; the 404 uses an SVG filter to do this at render time.

- The ink is the text colour (`currentColor`), which on the page is
  `--color-fg`: black in light mode, `#F3F1EC` in dark mode. It follows the OS
  theme with no second file.
- Never coloured, never muted grey, never on a coloured field. The JW Anderson
  sage and orange grounds are their identity, not ours: the drawing sits on
  `--color-bg` like everything else.
- On the inverted AI and contact surfaces, the ink takes that surface's text
  colour, so it still reads.

## Size and placement

- **Size from the drawing's height**, using the spacing scale: `48`, `64`,
  `96` or `128`px. Below 48px hatching turns into grey mush, so use the
  smallest size only for simple silhouettes. Ornaments with dense hatching need
  96 or 128.
- Never scale one past the resolution its hatching was traced at. Never
  stretch it out of proportion.
- **Anchor it to the composition.** For a standing creature or rooted sprig,
  its lowest ink touches a real hairline (`--color-line`, 1px) or the page edge, exactly as
  the grasshopper stands on the search rule. Measure it in the DOM with
  `getBoundingClientRect`, not by eye: the bottom of the drawing's `viewBox`
  sits on the rule's top edge. Airborne poses do not need to touch a rule.
- Spacing around it comes from the scale (`4 8 12 16 24 32 48 60 64 96 128`).
  It sits inside the 640px column unless it is a deliberate edge ornament. It
  never leaves the column the way a thumbnail does.
- Facing: a moving creature faces into the page or toward the content it
  belongs to, never off the edge. Mirror it (`scaleX(-1)`) if the plate faces
  the wrong way.

## Rendering

The SVG must take the theme colour, and an `<img>` cannot do that. Use a CSS
mask so no SVG loader is needed:

This is built as `components/Engraving.tsx`, styled by `.engraving` in
`app/globals.css`:

```tsx
<Engraving name="fiddler-crab" height={24} />
```

`height` is a spacing-scale step: `12`, `16`, `24` or `32` (48, 64, 96 or
128px). The component looks up the file's `viewBox` in `ENGRAVINGS` for the
aspect ratio, so the width follows. The mask paints with `currentColor`. It
is not a Markdoc block yet. If one is added, record it in
`doc/case-study-modules.md`.

Do **not** put an engraving inside `.point-figure`: its `*` rule sets
`fill: none` and wipes out the drawing.

## Behaviour

- Decorative: `aria-hidden="true"`, no alt text, never focusable, never a link
  target, and never covering the view cursor's hit area.
- Static by default. No hover change, parallax, scroll effect, or idle loop
  for decorative ornaments.
- The 404 tree is explicitly approved to loop its growth and falling-leaf
  sequence; show `404-tree-still.png` when reduced motion is requested.
- For other sequence animations, use a Lottie
  export played by `components/LottieSequence.tsx`, and it holds still under
  `prefers-reduced-motion`.

## Checklist before calling an import done

- [ ] Public-domain or Matt-owned source, recorded in the SVG's first line.
- [ ] One path colour (`currentColor`), no strokes, no raster, tight `viewBox`.
- [ ] Under ~40KB gzipped, hatching still separate lines at the size used.
- [ ] Uneven expressive contour, sparse detail, open interiors, recognizable pose.
- [ ] Rendered through `.engraving`, so it reads in light and dark mode
      (check both with the Browser pane's colour-scheme emulation).
- [ ] Height on the spacing scale. Standing subjects meet their hairline,
      measured in the DOM; airborne subjects have deliberate clear space.
- [ ] Only engraving on screen; not in a point, gallery, thumbnail or dock.
- [ ] `aria-hidden`, not focusable, no motion.
