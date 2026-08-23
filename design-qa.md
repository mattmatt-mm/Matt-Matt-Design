# Design QA — AI tab experience

- Date: 2026-08-23
- Local implementation result: **PASS**
- Production provider and inbox verification: **PENDING**
- Browser verification viewport: 1280 × 720
- Reference export viewport: 400 × 954

## References

The implementation was checked against the refreshed files in `raw/AI/`:

- `1. Normal State.svg`
- `2. Ask State.svg`
- `3. Thinking.svg`
- `4. Response.svg`
- `4.1. Response (follow up).svg`
- `4.2 Leave an email.svg`
- `4.2.1 Leave an email filled state.svg`
- `5. Back to ask state.svg`

Matt's later written rules remain authoritative where an export differs: 16px
radii, no hard border, a blurred 1px inner edge and soft 20px outer reach, an
8px response/form gap, full-width text-only `Send to Matt`, a 16px muted back
arrow, Helvetica Neue, and a centered cloud in every active state.

The original opening behavior used the official
[liquid-taffy](https://github.com/arknow91/liquid-taffy) source and supplied
liquid-neck reference. That result is superseded by the later motion recording
and the simplified-opening QA below. Character behavior remains checked against
the official [Bloub](https://github.com/jeremy-prt/bloub) source.

## Visual fidelity

- **PASS** — The normal dock is a 296×52px stack: 236px navigation shell, 8px
  gap, and 52px AI trigger.
- **PASS** — Computed styles confirm `border: 0`, `border-radius: 16px`,
  `inset 0 0 1px rgb(0 0 0 / 25%)`, and the soft
  `0 4px 20px rgb(0 0 0 / 10%)` outer shadow on both navigation and trigger.
- **PASS** — Helvetica Neue is the first global font-family choice.
- **PASS** — Opening moves the navigation 12px left while fading and blurring it
  by 3px. The cloud moves from the trigger to horizontal center and keeps that
  centered anchor throughout ask, thinking, answer, follow-up, and contact.
- **SUPERSEDED** — The mounted liquid-taffy overlay was later shown to lead the
  cloud and flash during its handoff to the persistent composer. It is retained
  only as a dormant experiment and is no longer part of the opening flow.
- **PASS** — The settled Ask surface is 345×96px and Thinking is 124×49px. A
  short Response retains the 345×117px minimum, while longer answers and the
  first answer plus follow-up stack grow upward from their content.
- **PASS** — The back arrow is a muted 16px Phosphor icon inside a 44×44px target.
- **PASS** — The Bloub character renders source cloud geometry and all 16 source
  expressions. Product state selects a small expression family; idle state
  changes expression occasionally, gaze travels left/right, and pointer motion
  resumes direct eye tracking without moving the layout anchor.
- **PASS** — The first completed answer reveals a full-width compact
  `Follow Up?` composer exactly 8px below the response. It expands from one to
  three lines, then scrolls vertically inside; the final answer exposes no third
  prompt.
- **PASS** — The email response, fields, and button match the refreshed 4.2
  geometry. Response/form and form/button gaps are 8px; `Send to Matt` is
  full-width, text only, and icon-free.
- **PASS** — The sunset line Border Beam is absent while thinking/streaming and
  appears only after a response completes.
- **PASS** — The gradient mask separates active AI controls from the portfolio
  without shifting page layout.

Intentional written-rule overrides to the SVG exports:

- `Send privately to Matt` is replaced by `Send to Matt`.
- The response and contact form remain separate with an 8px gap.
- The close/back control remains available in every active state so closing does
  not reset the session.
- The disclosure above the first composer remains because it is part of the
  approved privacy plan.

## Interaction and accessibility

- **PASS** — Opening focuses the question textarea. Escape closes the layer and
  returns focus to `Ask Matt's AI`.
- **PASS** — Enter submits; the composer keeps Shift+Enter and IME guards.
- **PASS** — The first question and single follow-up complete through the local
  deterministic stream. The final answer has no follow-up field.
- **PASS** — Close/reopen restores the exact in-memory answer or form state.
  Refresh clears visible conversation history.
- **PASS** — A private-information question reaches the approved email handoff.
  Empty and filled states were rendered with fake QA data; the form was not
  submitted and no email was sent.
- **PASS** — Thinking, answer-ready, contact progress, sent, and error text use a
  polite atomic live region.
- **PASS** — Hidden navigation links and trigger are removed from the tab order
  while AI is active.
- **PASS** — Browser development logs contain no runtime errors.
- **PASS by layout inspection** — At widths below 400px, main AI surfaces use
  `calc(100vw - 56px)` and the dock uses `min(296px, 100vw - 48px)`, preventing
  horizontal overflow at the 320px breakpoint. At 1280px the 400px AI viewport
  and mobile-sized controls remain horizontally centered.
- **PASS** — Reduced motion removes the taffy spatial transition, ordinary
  geometry tweening, and transient content blur.

## Data and cost controls

- **PASS** — Only allowlisted free GLM and Hermes model IDs may run; there is no
  paid or open-ended router fallback.
- **PASS** — Responses are plain text, third-person, language-matched, and capped
  to 100 language-aware words plus a conservative token ceiling.
- **PASS** — Unknown, private, contact-only, and prompt-injection topics route to
  the contact outcome before model generation.
- **PASS** — The signed HTTP-only turn cookie stores a question digest, turn
  count, and expiry rather than transcript text.
- **PASS** — Same-origin, JSON, input-size, timeout, in-flight, honeypot, and
  warm-instance rate-limit controls are present.
- **PASS** — Visitor email and note go only to the dedicated Resend route and are
  never added to the model prompt.
- **PASS** — The interface contains no model, token, quota, word-count, turn, or
  chat-limit copy.

## Build verification

- **PASS** — `npm run typecheck`
- **PASS** — `npm run build`
- **PASS** — `git diff --check`

## Production checks still required

The required OpenRouter, turn-secret, and Resend variable names are configured
locally. This QA intentionally ran the server with provider keys disabled so it
could exercise deterministic approved copy without spending tokens or sending
email.

Before production release:

1. Configure the same server-only variables in the deployment environment.
2. Verify the Resend sender domain and perform one authorized inbox delivery
   test with reply-to set to the visitor.
3. Exercise multilingual, private, unknown, timeout, and 100-word behavior
   against the live allowlisted OpenRouter model.
4. Recheck free-model availability and configure durable edge rate limiting.
5. Enable raw transcript review only if Matt accepts the disclosure, redaction,
   and provider retention terms documented in `doc/ai-tab-experience-plan.md`.

final result: passed

---

# Design QA — gallery refraction parity and visible navigation elevation

- Date: 2026-08-23
- Source visual truth: `/var/folders/30/99tph7dj13z43b18vvrr41xr0000gn/T/codex-clipboard-198e3974-3c03-492a-aacd-e7a0581f87d7.png`, together with Matt's clarification that the project-page lens is the behavioral reference and `doc/taste.md` sections 4–5 for elevation
- Source dimensions: 1250 × 428 px; source CSS viewport and density are unknown
- Implementation screenshot: `/private/tmp/gallery-refraction-navigation-after-full.png`
- Implementation screenshot dimensions: 749 × 675 px, captured from the in-app browser at a 1280 × 720 CSS viewport with devicePixelRatio 2; the browser surface applied its own display scaling
- Combined comparison input: `/private/tmp/gallery-refraction-navigation-comparison.png`
- Density normalization: the 1250px-wide source was proportionally reduced to the implementation's 749px output width before both captures were placed in one comparison image; no conclusions were drawn from browser-density-dependent absolute scale
- State: Gallery route, light theme, AI closed, Bowtie gallery image crossing the lower refraction band

## Full-view and focused comparison evidence

The combined comparison opens the supplied pre-fix Gallery capture and the
post-fix browser capture in one image. It keeps the complete image/lens/dock
relationship visible. A separate focused crop was not needed because the
navigation labels, both squircle edges, the lens content, and the image's left
and right boundaries remain readable in the combined input.

## Comparison history and findings

- **Earlier P1 — fixed:** Gallery could stretch its captured image across the
  lens width, making it appear horizontally zoomed relative to project pages.
- **Fix applied:** lens x sampling now maps each viewport CSS pixel to the same
  document CSS pixel. The horizontal barrel displacement was removed, while
  the existing nonlinear y profile remains responsible for elongation.
- **PASS — post-fix lens evidence:** the Bowtie gallery image and its refracted
  continuation retain the same 500px horizontal boundaries. Only y sampling
  changes through the band. The canvas reached `data-ready="true"` on both
  `/gallery` and `/work/bowtie-jp-health`.
- **Earlier P2 — fixed:** the three-layer navigation shadow token was assigned
  to elements that also carried the squircle clip path, so the rendered shadow
  was absent or visually clipped.
- **Fix applied:** the existing 1px, 4px, and 20px black-at-5% shadow token now
  renders on unclipped outer shells; the visible inner surfaces remain the same
  single 16px, 0.6-smoothed squircles with no decorative border.
- **PASS — post-fix elevation evidence:** both the 236×52px navigation parent
  and the separate 52×52px AI trigger show the full shared shadow stack. The
  8px gap and overall 296px dock-row width are unchanged.
- **PASS — fonts and typography:** Helvetica Neue, sizes, line heights, weights,
  labels, and wrapping are unchanged.
- **PASS — spacing and layout rhythm:** content width, image width, navigation
  dimensions, squircle geometry, active-tab inset, and dock position are
  unchanged.
- **PASS — colors and visual tokens:** theme-aware surface colors remain intact;
  both elevation surfaces consume the existing shared shadow token.
- **PASS — image quality and asset fidelity:** the source gallery imagery,
  Phosphor icons, and Bloub avatar are unchanged and remain sharp.
- **PASS — copy and content:** no visible or accessible copy changed.
- **PASS — interaction states:** project-to-gallery navigation works and sets
  `aria-current="page"`; opening AI fades/blurs the dock and removes the trigger
  shadow, while closing AI restores both shadow stacks.

## Verification

- **PASS** — browser checks on `/gallery` and `/work/bowtie-jp-health`.
- **PASS** — Gallery navigation and AI open/close interaction checks.
- **PASS** — no browser console errors; one unrelated Next.js LCP advisory was
  present for the existing first gallery image.
- **PASS** — React best-practices review found no new hook, rendering,
  accessibility, bundle, or component-structure issues.
- **PASS** — `npm run typecheck`.
- **PASS** — `git diff --check`.
- Build was not rerun because an existing development server is active against
  the shared `.next` directory; this repository explicitly prohibits running
  both concurrently.

No actionable P0, P1, or P2 findings remain.

final result: passed

---

# Design QA — simplified AI opening motion

- Date: 2026-08-23
- Source visual truth: `/Users/mattmatt_mm/Desktop/Screen Recording 2026-08-23 at 4.55.42 PM.mov`
- Source video: 1274×538px, 2.576 seconds, approximately 57.5fps
- Source contact sheet: `/private/tmp/ai-taffy-recording-contact-sheet.png`
- Source contact sheet pixels: 2588×839px
- Implementation: `http://localhost:3000/`
- Implementation screenshot: `/var/folders/30/99tph7dj13z43b18vvrr41xr0000gn/T/ai-opening-simple-final-1274x538.png`
- Implementation screenshot and CSS viewport: 1274×538px at 1× density
- State: closed dock → primary Ask composer

## Comparison history

- **Earlier P1 — temporal split and end-state flash.** The recording shows the
  temporary goo panel moving ahead of the persistent cloud, growing from a
  visibly separate origin, and disappearing before the resting composer takes
  over. The full sequence therefore reads as an overlay swap rather than one UI.
- **Fix applied.** The active flow no longer mounts `AiTaffyOpen`. Navigation,
  cloud, trigger-surface fade, and composer now share the same 300ms duration and
  site easing. The composer enters from 12px below with opacity 0 and 3px blur;
  navigation performs the inverse 12px-left fade/blur; the cloud moves to center.
- **Post-fix evidence.** The source contact sheet and live implementation were
  viewed in one comparison input at the recording viewport. A slowed diagnostic
  preserved the production easing and found the same progress at one sample:
  cloud 76.5%, composer 76.5%, and navigation 76.5%. No `.ai-taffy-open` node
  existed at any sampled time, and the persistent composer was the only panel.

## Required fidelity surfaces

- **PASS — spacing and motion.** The 345×96px composer retains its resting
  position and enters vertically from below without a layer swap or flash.
- **PASS — typography, colors, and copy.** Helvetica Neue, muted disclosure,
  warm background, white composer, placeholder, and return icon are unchanged.
- **PASS — assets and image quality.** The original Bloub SVG remains crisp and
  is the same persistent cloud before, during, and after its centered movement.
- **PASS — responsive behavior.** The transition uses existing fixed anchors and
  shared viewport formulas; no new breakpoint-specific geometry was introduced.
- **PASS — accessibility.** Reduced motion still removes the transition and
  content animation; semantic focus, labels, and the 44px controls remain.
- **PASS — runtime.** The in-app Browser reported no console errors during the
  revised closed-to-Ask interaction.

Focused-region comparison was not needed: the defect was the timing relationship
among the complete dock, cloud, and composer, all clearly visible in the full
1274×538 frame sequence.

## Build verification

- **PASS** — `npm run typecheck`
- **PASS** — `npm run build`
- **PASS** — `git diff --check`

---

# Design QA — adaptive AI content height

- Date: 2026-08-23
- Issue reference: `codex-clipboard-79300c57-e0fb-479a-a2be-046035e12d39.png`
- Live comparison capture: `ai-adaptive-height-live.png`
- Verification viewport: 1280 × 720 CSS px

## Source/live comparison

The supplied cropped response and a live maximum-length response were opened in
the same comparison input. The reference's copy continues below its fixed black
surface, while the rebuilt black squircle, completion beam, and parent stack all
grow upward together and keep the full response inside the surface.

- **PASS** — A long QA answer rendered at 368px tall with matching
  `clientHeight` and `scrollHeight`, `max-height: none`, and no response-level
  scrollbar or clipped copy.
- **PASS** — The bottom anchor remained fixed while the response and
  answer/follow-up stack grew from their content.
- **PASS** — An empty follow-up measured 40px; a wrapped two-line value grew to
  59px; longer content capped at 80px with a 21px line-height.
- **PASS** — The follow-up kept `overflow-y: hidden` while growing and changed to
  `overflow-y: auto` only when its `scrollHeight` exceeded the three-line cap.
- **PASS** — The response/follow-up gap remained exactly 8px throughout growth.

## Build verification

- **PASS** — `npm run typecheck`
- **PASS** — `NEXT_DIST_DIR=.next-ai-adaptive npm run build`
- **PASS** — `git diff --check`

final result: passed

---

# Design QA — site-wide squircle corners

- Date: 2026-08-23
- Local implementation: `http://localhost:3000/`
- Desktop verification viewport: 1111 × 834 CSS px
- Mobile verification viewport: 390 × 844 CSS px

## References and comparison

Corner behavior was checked against the official
[Squircle.js design article](https://squircle.js.org/blog/squircles-in-web-design)
and [Squircle.js React source](https://github.com/bring-shrubbery/squircle-js).
The approved `raw/AI/4.2 Leave an email.svg` and the live contact state were
rendered in the same visual comparison. Matt's later written rules override the
older SVG copy and border treatment.

## Geometry and visual fidelity

- **PASS** — Every current non-circular rounded surface is rendered through the
  shared `SiteSquircle` component. True circles, the organic Bloub cloud,
  dividers, and focus outlines remain intentional exceptions.
- **PASS** — The shared default is a 16px radius input with 0.6 corner smoothing;
  active dock-tab fills use the approved smaller 12px input.
- **PASS** — Live computed styles contain non-empty SVG `clip-path: path(...)`
  geometry on the navigation, three tab fills, AI trigger, composer, Thinking,
  completed response, follow-up composer, contact response, fields, and
  full-width action.
- **PASS** — Measured desktop surfaces remain faithful to the approved layouts:
  dock 236×52px, trigger 52×52px, composer 345×96px, Thinking 124×49px,
  response 345×117px minimum, follow-up 345×40–80px, fields 345×122px, and
  action 345×41px.
- **PASS** — The 1px/25% inner edge remains an inset shadow. The outer elevation
  uses `filter: drop-shadow(...)`, so the squircle clip path does not cut it off.
  No hard decorative border was reintroduced.
- **PASS** — `SquircleNoScript` is mounted in the root layout and CSS
  `border-radius` remains only as first-render/no-JavaScript fallback geometry.
- **PASS** — The source/live comparison preserves the approved 8px separation,
  black response and action, charcoal fields, centered cloud, text-only
  `Send to Matt`, and softer continuous corners.

## Responsive and interaction checks

- **PASS** — At 390×844, the contact stack and action are 334px wide at x=28px,
  matching `calc(100vw - 56px)` with zero horizontal overflow.
- **PASS** — Semantic links, buttons, textareas, labels, and live regions remain
  intact. Visual squircle surfaces are background siblings where clipping a
  focus outline would be unsafe.
- **PASS** — The deterministic local flow rendered ask, Thinking, completed
  response/follow-up, and private contact states without using a provider key or
  submitting the contact form.
- **PASS for this feature** — No Squircle.js runtime or hydration errors were
  logged. Existing `html2canvas`/Three.js scroll-lens console errors are outside
  this corner-geometry change and remain separately actionable.

## Build verification

- **PASS** — `npm run typecheck`
- **PASS** — `npm run build`
- **PASS** — `git diff --check`

final result: passed

---

# Design QA — smooth scroll lens refraction

- Date: 2026-08-23
- Source reference: `codex-clipboard-48b6777a-764e-4854-98aa-3ae2e9d18ea6.png`
- Source reference dimensions: 2374 × 467 px
- Desktop implementation capture: 1280 × 900 CSS px at 1× density
- Desktop focused comparison crop: 1280 × 180 px
- Mobile implementation capture: 390 × 844 CSS px at 1× density

## Comparison method

The source reference and a focused crop of the live implementation were placed
in one side-by-side visual comparison. Because the supplied reference is a
shallow crop from a different portfolio, fidelity was judged on the effect
itself: the fixed bottom band, live magnification, vertical stretching, RGB
fringing, and the relationship between the undistorted page and refracted copy.
The surrounding Matt Matt portfolio composition was intentionally preserved.

## Visual fidelity

- **PASS** — The 72px desktop band creates the same shallow lens strip at the
  bottom edge; it becomes 56px on mobile so it does not overpower the viewport.
- **PASS** — Live content is magnified and vertically stretched inside the band
  while the original page remains undistorted immediately above it.
- **PASS** — Scroll velocity adds a strong RGB split and directional shear. The
  moving capture reproduces the reference's most distinctive chromatic text
  fringe without applying that treatment to the resting page.
- **PASS** — The upper lens edge fades into the page rather than introducing a
  hard UI border.
- **PASS** — The effect follows the portfolio's existing narrow content column.
  Unlike the three-column source site, empty page margins remain optically quiet;
  this is an intentional content-layout difference, not a lens mismatch.
- **P3 / accepted** — The implementation uses slightly stronger peak RGB
  separation than the static reference crop so the effect remains legible during
  a short inertial scroll. No P1 or P2 fidelity issues were found.

## Interaction, responsive behavior, and accessibility

- **PASS** — Lenis provides global inertial wheel scrolling and anchors while
  the Three.js canvas renders only when the lens or page state changes.
- **PASS** — The canvas is fixed, `pointer-events: none`, and sits at z-index 45.
  The navigation and AI trigger remain interactive above it in their z-index 70
  dock.
- **PASS** — Desktop and mobile motion captures show the distortion tracking the
  live page content during actual wheel input.
- **PASS** — The 390px mobile viewport has zero horizontal overflow and a
  correctly sized 390 × 56px lens.
- **PASS by code inspection** — Reduced-motion preference disables the visual
  refraction and instructs Lenis to avoid animated interpolation.
- **PASS** — Browser development logs contain no runtime errors. Existing Next
  image LCP development warnings are unrelated to the lens implementation.

## Build verification

- **PASS** — `tsc --noEmit`
- **PASS** — `next build`
- **PASS** — `git diff --check`

final result: passed

---

# Design QA — mirrored lens refinement

- Date: 2026-08-23
- Motion reference: `ScreenRecording_08-23-2026 18-00-28_1.mov`
- Annotated reference: `codex-clipboard-f819987b-31e1-4c71-9716-f30488042620.png`
- Matched comparison viewport: 1206 × 662 CSS px
- Desktop verification viewport: 1280 × 900 CSS px
- Mobile verification viewport: 390 × 844 CSS px

## Comparison method

A representative frame from the supplied motion reference and the rebuilt Melo
page were opened together at the reference video's 1206 × 662 viewport. The
comparison focused on the horizontal hinge, the reflection direction, changing
glyph proportions, chromatic text fringe, and the absence of a dark blended
strip. Separate desktop and mobile states placed both typography and phone
contours immediately above the lens boundary.

## Visual fidelity

- **PASS** — Content below the horizontal boundary is now sampled from directly
  above that boundary with an inverted vertical axis, producing a true mirror
  rather than a continuation of content lower on the page.
- **PASS** — The mirror polynomial is continuous at the hinge and changes its
  derivative through the band, so text does not retain one constant scale or
  silhouette.
- **PASS** — The entry cross-fade occupies only the first 10% of the band
  (approximately 3–4px on desktop), removing the visibly separated blended area.
- **PASS** — Edge-oriented RGB sampling remains visible on thin letterforms and
  dark/blue phone contours while flat white regions remain optically quiet.
- **PASS** — The effect footprint is exactly halved from 72px to 36px on desktop
  and from 56px to 28px on mobile.
- **P3 / accepted** — The portfolio's dock sits above the lens by design; its
  controls remain crisp while page content behind it reflects independently.
  No P1 or P2 fidelity issues were found.

## Responsive, interaction, and runtime checks

- **PASS** — At 1280 × 900, the live lens measures 1280 × 36px and remains fixed
  at the viewport edge without horizontal overflow.
- **PASS** — At 390 × 844, the live lens measures 390 × 28px with zero horizontal
  overflow.
- **PASS** — The WebGL canvas reaches `data-ready="true"` after the page capture,
  and the mirror/rainbow output is visible at rest and during inertial scrolling.
- **PASS** — Navigation remains interactive above the non-interactive canvas;
  reduced-motion behavior remains unchanged.

## Build verification

- **PASS** — `npm run typecheck`
- **PASS** — `npm run build`
- **PASS** — `git diff --check`

final result: passed

---

# Design QA — concentric squircle navigation border

- Date: 2026-08-23
- Source visual truth: `/var/folders/30/99tph7dj13z43b18vvrr41xr0000gn/T/codex-clipboard-460aa984-b487-45d2-920d-06f5e0d34a1a.png`
- Source dimensions: 882 × 526 px annotated close-up
- Implementation full capture: `/private/tmp/nav-border-layer-final.png`
- Implementation viewport: 390 × 844 CSS px at 1× density
- Focused implementation comparison: `/private/tmp/nav-border-layer-final-focus.png`
- Focused comparison dimensions: 834 × 528 px, normalized from a 139 × 88 px crop at 6×
- State: home route, light theme, AI closed

## Comparison method

The supplied annotated close-up and the normalized live navigation crop were
opened together in the same visual comparison. The crop scale matches the
reference's approximately 6× inspection zoom, making the four corner joins and
the 8px separation between the dock and AI trigger directly readable.

## Comparison history and findings

- **Earlier P2 — fixed:** the visible inset box shadow followed a conventional
  16px CSS rounded rectangle while the surface itself used a 0.6-smoothed
  squircle clip path. This caused the border to detach at all four corners.
- **Fix applied:** the dock and AI trigger now each use a 16px outer squircle in
  `--color-line` and a concentric 15px inner squircle in `--color-surface`,
  separated by exactly 1px. The conventional inset shadow was removed.
- **PASS — post-fix visual evidence:** the top, bottom, and side strokes now
  merge continuously into the same softened squircle curve. No detached corner,
  square shoulder, doubled corner, or clipped elevation is visible.
- **PASS — spacing/layout:** outer sizes remain 236×52px and 52×52px, the row
  remains 296px wide, and the intentional 8px gap is unchanged.
- **PASS — colors/tokens:** the border uses the existing light/dark-aware
  `--color-line` token; the inner surface remains `--color-surface`.
- **PASS — typography:** icon size, label size, line height, active state, and
  alignment are unchanged.
- **PASS — image and icon fidelity:** the Phosphor navigation icons and organic
  cloud avatar remain unchanged and render cleanly inside the new frame.
- **PASS — copy/content:** Experience, Gallery, Writing, and the AI accessible
  label are unchanged.

## Responsive, interaction, and runtime checks

- **PASS** — At 390×844, the dock remains 236×52px at x=47 and the trigger
  remains 52×52px at x=291 with `scrollWidth === 390` and no overflow.
- **PASS** — Gallery navigation completed successfully after the frame change.
- **PASS** — Opening Matt's AI sets both new outer border layers and inner
  surfaces to opacity 0 with the existing transition, leaving no orphan frame.
- **PASS** — A fresh page load after restarting the isolated development cache
  produced no new browser error logs or runtime overlay.

## Build verification

- **PASS** — `npm run typecheck`
- **PASS** — isolated `npm run build`
- **PASS** — `git diff --check`

This section supersedes the earlier QA statement that accepted the inset
navigation shadow; the later user direction explicitly replaces that treatment.

final result: passed

---

# Design QA — borderless navigation elevation

- Date: 2026-08-23
- Source visual truth: `/var/folders/30/99tph7dj13z43b18vvrr41xr0000gn/T/codex-clipboard-be47fe0d-152a-4c01-9579-3d7a70da5dd6.png`
- Superseding treatment specification: `doc/taste.md`, sections 4 and 5
- Source dimensions: 1156 × 524 px; source CSS size and density were not
  available, so it was used as a layout/state reference rather than a
  pixel-scale target.
- Implementation full capture: `/private/tmp/lens-image-proportion-audit.png`
- Implementation dimensions: 1156 × 524 px at a 1156 × 524 CSS viewport and
  1× capture density.
- Implementation mobile capture: `/private/tmp/nav-shadow-stack-mobile-clean.png`
- Mobile dimensions: 390 × 844 px at a 390 × 844 CSS viewport and 1× capture
  density.
- Focused source crop: `/private/tmp/nav-source-focus.png` (640 × 160 px)
- Focused implementation crop: `/private/tmp/nav-shadow-stack-focus-sips.png`
  (344 × 104 px)
- State: Gallery route, light theme, AI closed; the source and live page use
  different scroll positions, so only the persistent navigation treatment was
  compared across the two full views.

## Comparison method

The supplied Gallery capture and the browser-rendered implementation were
opened together in one comparison input. A second comparison input opened the
focused navigation crops together. The screenshot records the prior hard-edge
treatment; Matt's later written direction and the authoritative taste guide
supersede that treatment with one filled squircle and a three-layer outer
shadow. Layout scale was not inferred from the source crop because its browser
density is unknown. Live bounding boxes were used to verify the unchanged
236×52px dock, 52×52px AI trigger, and 8px gap.

## Comparison history and findings

- **Earlier P2 — fixed:** the navigation used a second `--color-line`
  squircle as a one-pixel border. It read as a hard outline around filled
  controls and contradicted the latest elevation rule.
- **Fix applied:** the border wrappers and inner-radius compensation were
  removed. The dock and AI trigger now each render as one 16px, 0.6-smoothed
  squircle with the shared 1px, 4px, and 20px black-at-5% outer
  `drop-shadow` stack.
- **PASS — post-fix visual evidence:** the focused live crop shows a soft edge
  with no solid stroke, inset edge, second frame, square shoulder, or detached
  corner.
- **PASS — spacing/layout rhythm:** the live dock remains 236×52px, the trigger
  remains 52×52px, the overall row remains 296px wide, and the gap remains
  exactly 8px. At 390px wide, the dock starts at x=47 and the trigger at x=291
  with no horizontal overflow.
- **PASS — fonts/typography:** Helvetica Neue, label sizes, line heights,
  optical weights, wrapping, and active-state hierarchy are unchanged.
- **PASS — colors/tokens:** both surfaces retain the theme-aware surface fill;
  the new shadow uses one shared token and no raw component-level color.
- **PASS — image quality and asset fidelity:** the existing Phosphor icons and
  Bloub cloud avatar are unchanged, sharp, and correctly masked.
- **PASS — copy/content:** Experience, Gallery, Writing, and the AI accessible
  label are unchanged.
- **PASS — interaction states:** opening Matt's AI fades both single surfaces
  to opacity 0; closing restores them to opacity 1. No orphan border layer can
  remain because that layer no longer exists.

## Runtime and build verification

- **PASS** — the WebGL lens reached `data-ready="true"` in the Gallery state.
- **PASS** — no browser console errors were recorded after the live checks.
- **PASS** — `npm run typecheck`.
- **PASS** — isolated `npm run build`.
- **PASS** — `git diff --check`.

No actionable P0, P1, or P2 navigation differences remain. The lens proportion
question was audited separately and its shader was intentionally left unchanged
as requested.

final result: passed

---

# Current Design QA result — gallery lens and dock shadow

This is the latest QA result and supersedes the older note immediately above
that left the lens shader unchanged. Matt subsequently clarified that Gallery,
not the project page, was the route with the incorrect horizontal zoom.

- Full report: “Design QA — gallery refraction parity and visible navigation
  elevation” above
- Source visual truth: `/var/folders/30/99tph7dj13z43b18vvrr41xr0000gn/T/codex-clipboard-198e3974-3c03-492a-aacd-e7a0581f87d7.png`, Matt's route clarification, the live project-page behavior, and `doc/taste.md` sections 4–5
- Browser implementation evidence: `/private/tmp/gallery-refraction-navigation-after-full.png`
- Same-input comparison: `/private/tmp/gallery-refraction-navigation-comparison.png`
- Browser viewport/state: 1280 × 720 CSS px, devicePixelRatio 2, Gallery,
  light theme, AI closed; implementation artifact 749 × 675 px after in-app
  browser display scaling
- Result: x sampling is 1:1 across Gallery and project routes, y remains the
  only refracted geometry, both navigation surfaces render the shared unclipped
  three-layer shadow, and navigation plus AI open/close interactions pass
- Residual P0/P1/P2 findings: none

final result: passed
