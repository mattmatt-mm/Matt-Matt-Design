# ISD dot hero

- Status: shipped as the HKUST AIS thumbnail (`{% isd-hero /%}`); review page at `/lab/isd-hero` (not linked, not indexed)
- Requested: 2026-10-18

Replace the HKUST AIS thumbnail (the "How ISD Works?" still) with an animated
story of the dot that ends on the ISD logo.

## Format decision: code, drawn on a canvas

| | MP4 | Lottie | Code (Canvas 2D) |
|---|---|---|---|
| Size | ~2–4 MB for ~17s at retina width. Halftone dots are the worst case for video compression: fine, high-contrast detail shimmers and smears | Hundreds of dots × size keyframes gives a very large JSON, and slow playback in lottie-web's SVG renderer | ~10 KB of script plus ~6 KB of logo dot data |
| Sharpness | Fixed pixels, soft on retina, compression artefacts on dots | Sharp | Sharp at any size and screen density |
| Gooey split | Yes (made in After Effects) | **No.** Lottie has no threshold/goo effect | Yes, drawn as true vector "metaball bridges" |
| Light/dark theme | One fixed look | Fixed | Can follow the theme, or stay fixed |
| Reduced motion | Must swap for a still | Must swap | Shows the finished logo, exactly |
| Lands on the real logo | Approximately | Approximately | **Exactly**: the logo's own SVG paths are drawn in the last frame |

**Recommendation: code.** It is the lightest and sharpest option, and the only
one that does all four beats well. If an MP4 is ever wanted (for a deck or
social post), the same code can render frame by frame into a video, so
nothing is lost by choosing code first.

Canvas 2D rather than WebGL: about 1,500 circles per frame runs at 60fps on a
phone in Canvas 2D, it works the same in every browser, and the goo can be
drawn as vector shapes instead of a blur filter (Safari's canvas lacks
reliable `filter`). WebGL would only be needed past ~5,000 dots.

## Motion language, read from the Kedonia Lottie files

Measured from `public/lottie/kedonia/*.json` (60fps, 800×800):

- **The main curve is `cubic-bezier(0.5, 0, 0, 1)`**: a calm start and a long,
  soft landing, used for scale, position and rotation (24 timed keyframes;
  durations 0.2–0.72s).
- **Fades use `cubic-bezier(0, 0, 0, 1)`**: they arrive at once and settle
  (opacity mostly; 0.3–1.05s).
- **No overshoot keyframes.** Things settle; nothing bounces past its mark.
  Entrances scale from 50% to 100%; a camera push settles from 110% to 100%.
- **A press is a pulse**: 100% → 80% → 100% over 0.4s.
- **Holds between beats.** Each move finishes, rests, then the next begins.
  The many linear keyframes in the files are these holds.

The hero uses the same curves, 60fps, and the same habit of resting between
beats. Professional motion practice agrees: ease in slowly, land long, and
let one thing move at a time.

## The ISD logo, as data

`ISD logo.svg` (3456×3976) is 330 paths and 408 sub-shapes: three halftone
wedges turned 120° apart around an empty triangle. Each wedge is a grid of
round dots that shrink from the centre outward, with a solid band along the
inner edge punched with small square holes.

A one-off script will read every dot's centre and radius from the paths, so
the animation's dots can travel to the logo's real dot positions. The final
frame draws the logo's own paths (canvas `Path2D` accepts SVG path data
directly), so the end state is the logo itself, not a likeness.

## Storyboard (~17s, then loop)

**1. One dot (0–3.5s).** A single dot fills the frame. The camera slowly pulls
back (scale 3× → 1×, the main curve, 3.5s). At 1.2s the dot buds: it splits
into two, then four, then seven dots of different sizes. Each child stretches
away on a gooey bridge that thins and snaps, then settles. Sizes follow a
ratio so no two are equal.

**2. Dots make shapes (3.5–9.5s).** The loose dots fly into place on a faint
matrix of small dots that fades in around them. Within the matrix, dots swell
to draw the four shapes from the ISD rooms, one after another, each held
about a second:

- *Diverse*: scattered clusters, small and light
- *Connect*: a sweeping line joining two groups
- *Unite*: a closed ring
- *Action*: a bolt, the boldest and largest dots

Each shape is stronger than the last: the dots grow larger and denser from
Diverse to Action, so "different shapes have different strengths" is
something you can see. A small label names each shape, as on the doors
(`/diverse`, `/connect`, …).

**3. Many dots, one wave (9.5–13s).** The camera pulls back to reveal a much
larger field, about 40×24 dots. A diagonal wave runs through it, each dot
swelling and shrinking as the crest passes, twice across.

**4. Becoming the logo (13–17s).** The camera keeps pulling back and turns.
The field gathers into three wedges, 120° apart. Dots outside the wedges
shrink away; dots inside slide to their exact places in the logo, large near
the centre and small at the edges, and the inner bands fill in. It lands on
the ISD logo and holds for two seconds.

**Loop.** The logo draws in on itself back into a single dot, which is where
the story starts.

## Behaviour on the page

- Sits where the AIS thumbnail is now: the 840px opening slot, 16:9.
- Starts when half of it is on screen; pauses off screen and in a background
  tab, like the case-study videos.
- Reduced motion: the finished logo, still.
- Script loads only when the hero is near the screen, so the rest of the site
  pays nothing for it.
- Pixel density capped at 2× to keep phones cool.
- The home card's morph needs an image to land on. The AIS card shows the
  stamps, and the hero opens on a single dot, so this case study will
  cross-fade instead of morphing.

## Build steps

1. Extract the logo's dot centres, radii and band paths into
   `public/isd/logo-dots.json`.
2. Build the hero as a standalone review page with a timeline scrubber and
   play/pause, so Matt can judge each beat and its timing frame by frame.
3. Tune timing with Matt.
4. Add it as a module (`{% isd-hero /%}`), place it above AIS's first
   section, and add it to `doc/case-study-modules.md`.
5. Verify: 60fps on a throttled CPU, pausing off screen, reduced motion,
   phone width, both themes.

## Prototype (2026-10-18)

Matt chose ISD orange (#FCB041) on cream (#FCFAF6) in both themes, the
`/diverse` … `/action` labels, and a loop back into one dot.

- `scripts/extract-isd-logo.py` → `public/isd/logo.json`: 252 dots and the
  inner bands (kept whole per path so their square holes still cut out).
- `components/isd/easing.ts`: the two Kedonia curves.
- `components/isd/scene.ts`: the whole story as `drawScene(t)`; beat start
  times live in `BEATS`, so retiming is a matter of moving numbers.
- `components/isd/IsdDotHero.tsx`: the canvas; plays when half on screen,
  rests on the logo under reduced motion.
- `app/lab/isd-hero` + `components/isd/IsdReview.tsx`: scrubber, beat
  buttons, 0.25×/0.5× speed, frame stepping, live fps.
- Measured at the heaviest beat (the wave, ~3,600 dots): median frame 16.7ms,
  worst 17.6ms on the Mac. Not yet measured on a phone.

## Answered questions

- **Colour:** ISD orange on cream like the current hero in both themes, or
  black dots that follow the page theme like the logo file?
- **Labels:** show `/diverse`, `/connect`, `/unite`, `/action` during beat 2,
  or let the shapes speak alone?
- **Ending:** loop back into one dot, or play once and rest on the logo?

## Revision 2 (built 2026-10-18)

Matt reviewed v1 and redirected the story. His notes, and what each changes:

| Matt's note | v1 did | Revision 2 |
|---|---|---|
| Every dot comes from the first one | The matrix faded in around the beads | The matrix is **grown by division** from the first dot |
| Something always moves | Shapes grew, then held still | No holds: every beat carries its own continuous motion |
| Keep the flow; don't reverse without reason | Each beat started fresh, camera stopped between beats | One continuous camera path; rotation always clockwise; each beat leaves in the direction the next one needs |
| The four rooms come from the real artwork | Hand-made shapes | Shapes taken from `raw/Case Study/HKUST AIS/{Diverse,Connect,Unite,Action}.svg` |
| Diverse is a world map | Gaussian clusters | The map's continents, with the ocean moving in irregular waves |
| Connect is two ripples colliding | An S-curve | Two ripple sources whose rings meet and interfere |
| Colliding people form a team | A ring appeared | The collision pulls the dots into the team ring as the camera pulls back |
| A team sprints | A static bolt | The runner from Action.svg, legs in a running cycle, two teammates as shadows |
| Remove the wave | A diagonal wave beat | Removed: the ocean and the ripples carry that role |
| The ending radiates and dives into the triangle | The logo collapsed into a dot | Logo dots radiate outward with a slight shake while the camera dives into the empty triangle, leaving a blank frame |

### Data from the artwork

A second extraction script reads the four room SVGs into dot-size maps on
their own grids (Unite 24 × 24 at 43.3 apart; Connect 22 × 22 at 47 apart;
Action 724 dots; Diverse is drawn as paths, so its dots are read by shape the
way the logo's are). Each map is normalised (smallest dot = 0, largest = 1)
and placed on the hero's matrix, centred. The labels on the artwork
(`/DIVERSE` …) are dropped from the data; the hero draws its own.

### Motion rules for this revision

- **Never still.** Each beat has a motion that runs for its whole length
  (ocean, ripples, the team circling, the run cycle, the logo's slow turn).
  A beat's own motion keeps going while the next beat arrives on top of it.
- **One camera.** Zoom and rotation follow one smooth path through the whole
  piece, never two separate eases that stop and start. Rotation only ever
  turns clockwise. The camera slows but never parks.
- **Motivated reversals only.** The story moves outward (division, ripples)
  until the collision, which is the one moment the flow turns inward
  (gathering into the team). After that everything moves forward, in the
  runner's direction, until the logo forms.
- **Overlaps instead of hand-offs.** Each transition starts before the last
  one settles, so speed carries across the seam.
- Kedonia's curves still drive the individual moves; the continuity comes
  from overlapping them, not from new curves.

### Storyboard (~23s, loop)

**0. From nothing (0–0.8s).** Empty cream frame. A single dot swells out of
the centre. (This is also where the loop lands, so the end's empty frame and
the start are the same picture.)

**1. One dot divides (0.6–5.0s).** The camera begins a long, slow pull-back
that never stops. The dot buds with gooey bridges into dots of different
sizes, as in v1. Then the division keeps going: each new dot buds the next
ring outward, so a front of division radiates from the centre and lays down
the whole matrix. Every dot on screen can be traced back to the first one.
Only the first few generations are close enough to show their gooey bridges;
farther out the buds are too small to need them.

**2. /diverse — the world (4.5–8.5s).** Following the same outward front,
dots on the land swell into the continents of the Diverse map. The ocean
never settles: its dots rise and fall in irregular waves (a few overlapping
swells of different directions and speeds), so the map breathes while the
continents hold.

**3. /connect — two ripples (8.0–11.5s).** Two points on the map, one left
and one right, start dropping ripples. Rings spread outward from each,
dissolving the continents as they pass (the outward flow continues). Where
the two sets of rings meet, their crests add up and the dots there swell
brightest: the collision. This draws the crossing paths of the Connect
artwork at the moment the rings meet.

**4. /unite — the team (11.0–14.0s).** At the collision the flow turns inward
for the first time: the camera pulls back and the bright dots are drawn into
the Unite ring. The ring keeps turning clockwise, the same way the camera
turns, so the team visibly circles.

**5. /action — the sprint (13.5–18.0s).** The ring opens forward into the
Action runner: the main figure, with two teammates behind and either side as
softer shadows (as in Matt's annotation). The arms and torso hold the
artwork's shape; the legs are redrawn every frame from a running cycle
(thigh and shin swinging on a stride of about 0.5s), so the figure runs in
dots. The teammates run the same cycle a beat behind. The matrix streams
backwards behind them and the camera tracks forward, so the run reads as
speed, not a pose.

**6. The logo (17.5–21.0s).** Still moving forward, the runners carry into
the logo: the camera pulls back and keeps turning clockwise as the dots
gather into the three wedges and the bands fill. It keeps turning slowly
while it is the logo.

**7. Back to empty (20.5–23.0s).** The logo's dots push outward from the
centre, trembling slightly as they go, while the camera dives into the empty
triangle at the logo's heart. The triangle grows past the frame's edges until
the frame is empty cream, which is frame 0 again.

### Build steps

1. Extract the four room SVGs into dot-size maps (`public/isd/rooms.json`).
2. Replace the per-beat camera with one continuous path (keyframes joined by
   a monotone curve, rotation monotonic).
3. Division growth: give every matrix dot a parent and a birth time from its
   distance to the centre; draw goo only for early generations.
4. Diverse: map plus ocean swell. Connect: two ripple sources with
   interference. Unite: gather to ring and orbit. Action: runner with a
   procedural leg cycle and two delayed shadows, matrix streaming backwards.
5. Logo, then radiate-and-dive ending; check the loop seam frame by frame.
6. Remove the wave beat. Update the review page's beat list.
7. Verify 60fps (the ocean and ripples touch every dot every frame), and
   review on the scrubber with Matt.

### As built

- `scripts/extract-isd-rooms.py` → `public/isd/rooms.json`: Diverse 22 × 22,
  Connect 22 × 22, Unite 24 × 24, Action 27 × 27 dot-size maps.
- The opening keeps v1's gooey split into seven beads, because budding the
  whole matrix straight from the first dot piled dozens of overlapping dots
  into a splat. The matrix then buds outward from the beads, each new dot
  travelling out of a neighbour, and each bead hands itself over to a
  matrix cell, so every dot still traces back to the first one.
- Rooms are sampled in screen orientation, so they read upright while the
  matrix turns beneath them.
- Action: the runner's body comes from Action.svg above the hips; its legs
  are drawn from a running cycle (0.55s stride) every frame, and two
  teammates run the same cycle at 45% strength, a step behind.
- The logo's dots grow to size ahead of arriving, so the hand-off from the
  sprint never leaves an empty frame.
- Measured on the Mac at the ripples, the sprint and the ocean: median frame
  16.7ms, worst 17.7ms. Not yet measured on a phone.

## Revision 3 (built 2026-10-18)

Matt's notes on revision 2, and what changed:

1. **Round spread, rippling edge.** The matrix is now a disc, and each dot's
   birth is timed by straight-line distance from the first dot (stepping
   between neighbours had spread in a square). Every newborn dot swells
   briefly, so a ripple runs along the spreading edge.
2. **Connect: one ripple a side, in slow motion.** Each source drops a
   single ring; the rings pass through each other. The story clock dips to
   0.33× around the meeting (about 2s of real time), then returns to speed.
3. **Arms swing; slower stream.** Arms are drawn from the running cycle,
   swinging against the legs with bent elbows. The matrix streams at 0.35
   world units a second, down from 0.9.
4. **The leap.** At the end of the sprint the main runner leaps in slow
   motion (0.33×): legs open into a split, arms lift, teammates fade, and
   the whole matrix is drawn in towards the body. One ripple then spreads
   from the body as the dots morph into the logo.
5. **Level for the sprint.** The camera keeps turning clockwise until 90°,
   where the matrix reads level, holds the turn through the sprint while
   still pulling back, and turns on again with the leap.
6. **No blank at the loop.** The next first dot grows in the empty triangle
   while the camera dives in, ending at exactly the size and place the
   story starts from, so the seam is continuous.

Story time runs 22.2s; with the two slow-motion passages the loop lasts
about 26.5s of real time. `components/isd/scene.ts` keeps all timings in
story seconds; `BEATS` and `DURATION` are converted to real seconds.

## Revision 4 (built 2026-10-18)

1. **Beads shrink with the spread.** The big first dots start shrinking back
   to matrix size at 3.0s, as the spread begins, and slide onto their cells
   by 4.2s, instead of waiting for the spread to finish.
2. **A real world map.** `scripts/build-isd-world.py` draws simplified
   continent outlines and shades them like a contour map: the coastline is
   the strongest line, with rings every 16° inland. It is written into
   `rooms.json` as `world` and fills most of the frame width, drifting east
   while the ocean keeps moving. The coarse Diverse artwork is no longer
   used for this beat.
3. **A cleaner leap.** No more drawing the matrix in towards the body,
   which clumped everything together. Limbs are thinner, and no dot grows
   past the matrix spacing, so the figure keeps its shape.
4. **The sprint streams left.** The stream now runs along the screen's
   left, which at the sprint's 90° camera turn is world +y.
5. **A ripple into the logo.** From the top of the leap one ripple spreads
   from the runner's body; each dot turns into its logo position (or
   shrinks away) as the ring reaches it, and the runner dissolves the same
   way.
6. **Smaller collision dots.** The ripples and their meeting point are
   about a third the size they were.

Runner limb maths is skipped for dots far from any runner, which brought the
sprint back in line with the other beats.

## Revision 5 (built 2026-10-18)

- **No leap.** The sprint keeps running and the story clock slows it to
  0.33× for its last strides, while the ripple into the logo leaves the
  runner's body.
- **The logo is masked dots, as the real logo is.** The inner bands were
  drawn as flat shapes fading in over the dots, which read as a separate,
  discontinuous layer. `scripts/build-isd-logo-lattice.py` measures each
  wedge's diamond lattice (rows 0.046 apart, dots 0.065 apart) and its size
  curve (r = 0.0552 − 0.0431 × distance from the centre), carries the lattice in to
  the triangle, and records each wedge's outline. The hero draws all 538
  dots and clips each wedge to its outline: near the triangle the dots
  overlap into the solid band with square gaps, exactly how the logo is
  made. The band shapes are no longer drawn.
- Radiate pushes the whole logo out together, so the masks move with it.

## Revision 6 (built 2026-10-18)

- **Connect ends in plain dots.** The Connect artwork overlay drew two
  curved lines as the ripples met; it is gone, so after the ripples pass
  the dots return to the regular matrix.
- **No zoom during the sprint.** The camera holds its zoom while the matrix
  streams; it only turns level.
- **One stride into slow motion.** The runner takes a single stride that
  starts at running pace and eases off over 2.3 story seconds, while the
  story clock eases (over 0.9s) into 0.3× slow motion. The stream slows
  with it but never stops, so the frame never goes still before the ripple.
- The story is 2.55s shorter (19.65s), about 25s of real time with slow
  motion.

## Placed on HKUST AIS (2026-10-18)

- `{% isd-hero /%}` replaces the "How ISD Works?" still above the first
  section, so it opens the case study at the 840px thumbnail width. The old
  still is deleted. The Keystatic editor offers it as the "ISD dot hero"
  block.
- Source data moved to `scripts/isd-data/` (not served). The hero loads one
  packed file, `public/isd/hero.json` (78 KB, about 11 KB gzipped), only
  once it is within a screen of being seen.
- The home card's morph needs an image to land on, so opening AIS from the
  home page cross-fades.
