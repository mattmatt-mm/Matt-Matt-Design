# Illustration animation workflow

Use this workflow to turn an approved illustration into a short sprite-based
animation for this site. The worked example is the 404 oak: a sapling grows,
its leaves open, one leaf falls, and the animation pauses before repeating.
Matt approved this workflow and its 404 implementation on 2026-10-19.

This uses the same general frame-sheet approach as animated pets, but does
not create or upload a ChatGPT pet. Use the imagegen skill for artwork and
FFmpeg for frame assembly. Read `doc/engraving-graphics.md` for the drawing
style and `doc/taste.md` for site integration rules.

## Files from the oak example

| File | Purpose |
|---|---|
| `output/imagegen/404-oak-sapling.png` | Original approved illustration |
| `output/imagegen/404-tree-growth-sprites.png` | Generated 4 × 4 source sheet |
| `output/imagegen/404-tree-growth.gif` | Playable animation preview |
| `public/figures/404-tree-growth.gif` | Runtime animation |
| `public/figures/404-tree-still.png` | Final frame for reduced motion |
| `app/not-found.tsx` | Page and SVG ink filter |
| `app/globals.css` | `.not-found-tree` sizing and dark-mode treatment |

Keep source artwork in the repository, not only in the image tool's output
directory. Runtime assets belong in `public/figures/`. Use new filenames for
variants; replace an approved asset only when replacement is requested.

## 1. Generate and approve the still illustration

Use the built-in image-generation tool, with `transparent_background: true`.
A normal built-in generation does not require an API key. Read the current
imagegen skill before using its tool; do not substitute an API or CLI workflow
unless the user requests that path.

Reusable starting prompt:

> Create a small original [subject] for [page or use]. Use one-ink,
> hand-drawn woodcut-style contours that swell and taper, gentle asymmetry,
> a recognizable silhouette, and sparse short hatch marks. Leave most
> interiors open. Give it [pose or small playful detail]. Use a transparent
> background, with no scenery, text, frame, gradients, shadows, or paper
> texture. Keep the whole subject visible with clear padding. It must remain
> readable at [display size].

For the oak, the subject was a crooked young tree with lobed leaves, acorns,
and a small dangling spider. The generated animation simplified some details;
exact preservation of every small feature was not achieved.

Inspect the result before animating. Check silhouette, transparency, stroke
weight, and detail at actual UI size. A transparent canvas does not guarantee
transparent leaf or trunk interiors: the oak has light interior areas. Do not
claim a generated raster is a pure foreground-colour mask without checking it.

## 2. Generate the sprite sheet

Load the local approved image with `view_image`, then pass its path through
`referenced_image_paths`. Use `transparent_background: true`. Ask for a grid
of equal cells with fixed root position and camera; small growth stages must
remain on the same baseline as the mature tree.

Reusable prompt based on the oak generation:

> Transform the reference into an animation sprite sheet with exactly four
> columns and four rows, sixteen equal square cells, read left to right then
> top to bottom. Use a transparent background with no labels, numbers,
> borders, or grid lines. Preserve the reference's ink drawing style, with
> simplified detail for small display sizes. Every cell contains one frame.
> Fix the camera and root anchor: root centre at 50% of cell width, baseline
> at 88% of cell height. The mature tree reaches 12% from the top and fits
> inside the central 60% of the width, leaving space for a falling leaf.
> Frame 1: tiny shoot. Frame 2: taller shoot. Frame 3: stem with two buds.
> Frame 4: curved stem with two small leaves. Frame 5: three-leaf sapling.
> Frame 6: taller, four leaves. Frame 7: almost mature, with acorns.
> Frame 8: fully grown. Keep the mature trunk and remaining branches fixed
> in frames 9–16. Frame 9: rightmost leaf tilts. Frame 10: it detaches.
> Frames 11–14: the same leaf drifts right and downward, tumbling toward
> the roots. Frame 15: it lands. Frame 16: hold the final tree and leaf.
> No trails, extra trees, text, or scene backgrounds.

Inspect all cells before assembly. Check frame order, clipping, baseline,
leaf continuity, and whether the mature tree changes size. Generated sheets
can drift between frames even with explicit constraints. The selected oak
has visible flipbook wobble; this is not a perfectly registered animation.
If smooth registration matters, regenerate the sheet with a focused correction
before using it. Do not describe a prompt constraint as a verified result.

## 3. Assemble a playable GIF

Run these commands from the repository root. FFmpeg and FFprobe are required.
The filenames below reproduce the existing example; use new output names for
new subjects. FFmpeg may ask before overwriting existing files.

The generated oak sheet was **1254 × 1254**, despite requesting an equal grid.
`untile=4x4` rejected it because its dimensions were not divisible by four.
Normalize to 1280 × 1280 first, producing sixteen 320 × 320 frames.

```sh
ffmpeg -hide_banner -loglevel error \
  -i output/imagegen/404-tree-growth-sprites.png \
  -filter_complex 'scale=1280:1280,untile=4x4,setpts=N/(4*TB),split[a][b];[a]palettegen=reserve_transparent=1[p];[b][p]paletteuse=alpha_threshold=128' \
  -r 4 -loop 0 -final_delay 180 \
  output/imagegen/404-tree-growth.gif
```

This plays at four frames per second and loops indefinitely. `final_delay 180`
sets the last frame's delay to 1.8 seconds. GIF transparency is binary; the
alpha threshold can change thin antialiased edges, so inspect the preview.
Scaling fixes divisibility, not inconsistent drawing placement or grid spacing.

Verify the output:

```sh
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=width,height,nb_read_frames -of json \
  output/imagegen/404-tree-growth.gif
```

The oak result was verified as 320 × 320 with 16 frames, approximately 211 KB.
Play the GIF before approving its timing and loop boundary. It pauses on the
fallen leaf, then resets to a shoot; it is not a seamless growth loop.

## 4. Prepare runtime and reduced motion assets

```sh
cp output/imagegen/404-tree-growth.gif public/figures/404-tree-growth.gif
ffmpeg -hide_banner -loglevel error \
  -i output/imagegen/404-tree-growth.gif \
  -vf 'select=eq(n\,15)' -frames:v 1 \
  public/figures/404-tree-still.png
```

Frame indices start at zero, so frame 15 is the final frame. Extract from the
actual playback asset so the still matches the animation. For another sheet,
choose its final or most useful resting frame.

## 5. Integrate into the page

**Dark-mode compatibility is required for every graphic.** The page surface
must show through leaf and trunk interiors. Do not use a white or cream fill,
a flattened background, or simple colour inversion as the finished treatment.
Render ink using `--color-fg` so both themes use the site's actual palette.

The 404 uses an inline SVG containing the GIF and final PNG as `<image>`
elements. An SVG filter converts the raster's dark marks to alpha, discards
pale fills, and paints the resulting ink with `currentColor`:

```tsx
<filter id="not-found-tree-ink" colorInterpolationFilters="sRGB">
  <feColorMatrix
    type="matrix"
    values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.2126 -0.7152 -0.0722 1 0"
  />
  <feComponentTransfer result="ink">
    <feFuncA type="linear" slope="1.25" intercept="-0.2" />
  </feComponentTransfer>
  <feFlood floodColor="currentColor" />
  <feComposite in2="ink" operator="in" />
</filter>
```

Apply this filter to the group containing the images. Set the SVG colour to
`var(--color-fg)`. For opaque source pixels the alpha becomes
`clamp(1.25 * (1 - luminance) - 0.2, 0, 1)`: black stays ink, white and cream
vanish, and darker edge pixels retain intermediate alpha. Existing fully
transparent pixels remain transparent. This threshold is for this black-ink
source; inspect fine hatching before reusing it on another asset.

The SVG is decorative (`aria-hidden="true"`, `focusable="false"`,
`pointer-events: none`) and has a `0 0 320 320` viewBox. Its width is
`clamp(96px, 24vw, 128px)` with automatic height and no flex shrinking.
Under `prefers-reduced-motion: reduce`, hide the GIF image and show the PNG;
otherwise hide the PNG. Both pass through the same ink filter. Hiding the
animated image prevents visible motion but does not guarantee no GIF download.

See `app/not-found.tsx` and `.not-found-tree` in `app/globals.css` for the full
implementation. The source GIF still contains light interiors; the rendering
filter removes them. A raw GIF preview does not show the final themed result.

The animated raster does not use `Engraving.tsx`, whose CSS mask is designed
for single-colour SVG ornaments. The 404 now says “Nothing here. Yet.”;
remove obsolete subject-specific copy when replacing another illustration.

## 6. Validate and record the result

- Preview the animation at desktop and narrow mobile widths. Check copy,
  controls, root placement, padding, and clipping throughout playback.
- Check light and dark themes. Check reduced motion shows the PNG and
  produces no motion; CSS animation disabling alone cannot stop a GIF.
- Confirm the runtime URLs load and retain the intended transparency.
- Run `pnpm typecheck` and `git diff --check`. Do not add tests that only mirror
  this decorative markup.
- Update the inventory in `doc/engraving-graphics.md` and any obsolete agent
  guidance. Keep unrelated working-tree changes intact.
- Report the saved assets, integration, and any checks that remain blocked.

For the original implementation, FFprobe confirmed the animation's dimensions
and frame count and the still's 320 × 320 dimensions. `git diff --check` passed.
Typecheck was blocked by generated `.next-dev-4317` types referring to a missing
`app/(site)/gallery/page.js`. Browser verification was not recorded. Future
agents should perform those UI checks rather than treating this example as
fully browser-validated.


## Static illustrations from meaning

For Hermes Task's three problem sections, Matt requested new graphics without
referencing the earlier artwork. Read the section text first, then generate
one scene per idea using the built-in image tool. Do not pass the old images
as references. This request was for graphics; the replacements are static.

The reusable prompt set used these subjects:

- **People pile up:** hands holding an overflowing fan of contact cards,
  more cards arriving, small distinct portrait heads and short line marks.
- **Promises slip:** a handshake with a follow-up reminder falling below it,
  one empty checkbox, a reaching fingertip unable to catch it.
- **Apps wait to be opened:** an exhausted person with head in one hand,
  a closed laptop, a phone in the other hand, and one small message bubble.

Shared prompt constraints: original editorial woodcut-like black ink,
uneven swelling and tapering contours, sparse short hatching, open interiors,
true transparent canvas, no white or cream fills, no grey washes, no text,
no dense shading, no frame, landscape 8:5 composition, clear margins, and
legibility at 192 × 120 pixels. `transparent_background` was true for all
three generations, with no reference images. Preserve the PNG sources and
encode lossless WebP copies for the page without flattening alpha.

Check actual pixels before choosing a renderer. All three source assets had
no visible pixels with an RGB channel above 100; their interiors were already
transparent. They can therefore use CSS alpha masks directly, painted in
`--color-fg`. Unlike the tree, they do not need a light-fill removal filter.
Review previews of the mask painted in both theme colours, at display size.


## Pressure variation within each stroke

Matt clarified that a human pen touch requires width changes within the same
continuous line, with consistent overall pen weight across the illustration
set. Generic “hand drawn” prompts produced uneven weights across panels.

For revisions, preserve each scene's meaning but explicitly request a flexible
dip pen: hairline entry, thick pressed curves, finer lifted passages, and
pointed exits. Name the contours that must vary (fingers, sleeves, paper edges,
face, shirt folds). Keep hatch marks sparse. Use a newly generated member of
the set as a style reference, then compare all three at equal display scale.
If a panel stays too fine, ask for a stronger pressure contrast in a targeted
regeneration. Numeric widths in prompts are creative guidance, not measured
output guarantees. Do not simulate this by globally thickening every line.

Current sources: `output/imagegen/hermes-problems/*-pen-v3.png`. Current runtime
assets: `public/figures/hermes/*-pen-v3.webp`. The `pen-final-theme-preview.png`
contact sheet shows the selected masks in both theme colours. These revisions
were generated with the built-in image tool and retain transparent interiors.


## Hermes moving illustrations

Matt requested moving versions on 2026-10-19. Use the built-in image tool to
produce one 3 × 3 sheet per approved drawing. The nine frames depict contact
cards arriving, the reminder slipping past a hand, and a tired person noticing
a message. Keep camera, scale and fixed objects consistent. Generated sequences
can still have a little redraw wobble and simplify the approved still artwork.

Runtime format: lossless WebP sheets, 1152 × 720 (384 × 240 per frame), in
`public/figures/hermes/{people,promises,apps}-motion.webp`. Source sheets and
prompts live in `output/imagegen/hermes-problems/motion/`. The contact sheet
needed a second content pass to preserve portraits; its final source is
`people-sheet-final.png`. Despite a transparency edit, pale card interiors
remain in that source and must be removed by the renderer.

`components/InkSprite.tsx` renders the sheet inside a clipped 192 × 120 SVG.
A small client component preloads the sheet and waits until at least half the
figure is visible. It then starts a 4.5-second CSS animation once. Nine keyframes
step the sheet through a three-column grid at 8% intervals; the last frame
holds from 64% to the end. There is no infinite page loop. The final frame is
also the no-JavaScript and reduced-motion state. The observer disconnects after
entry and cleans up on unmount; the image preload also handles a cached asset.

The SVG filter first computes inverse luminance independently of source alpha,
removes pale tones with `feFuncA` slope 2 and intercept -1, multiplies the result
by `SourceAlpha`, and paints it with `currentColor`. The effective opacity is
`sourceAlpha * clamp(1 - 2 * luminance, 0, 1)`. This order preserves the alpha
of dark antialiased strokes. Subtracting luminance directly from source alpha
before thresholding had erased faint strokes and was corrected. A 3% viewport
inset prevents small neighbouring-frame marks from leaking into view.

Use this format for generated raster line art that needs precise theme colour
and CSS playback control. GIF is convenient for a portable preview, but has
binary transparency and limited playback controls. Animated WebP is useful for
compact standalone motion. SVG/CSS or Lottie is appropriate when the illustration
has genuinely editable vector paths; a generated sprite sheet does not become
vector artwork just by wrapping it in SVG or Lottie.

Verification: mobile browser showed the first and final poses, the transform
advanced from `(0, 0)` to `(-384, -240)`, and the browser reported no console
errors. Source typecheck passed with stale generated Next types excluded.
The light/dark GIF preview uses the same ink-filter calculation. Reduced-motion
behaviour is implemented in CSS; OS preference emulation was not available in
the browser tool for this check.
