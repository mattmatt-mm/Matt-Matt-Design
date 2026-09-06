# UI taste

- Status: authoritative design guidance
- Owner: Matt
- Updated: 2026-08-23

This file records Matt's reusable interface rules. Read it before proposing or
building UI. It complements the measured tokens in `CLAUDE.md`.

## 1. Source order

When sources disagree, use this order:

1. Matt's latest written instruction.
2. This taste guide.
3. The latest approved source file in `raw/`.
4. Existing tokens and layout rules in `CLAUDE.md` and `app/globals.css`.
5. Generated images and screenshots, which are references unless Matt selects
   them explicitly.

Record newly approved reusable decisions here. Do not preserve an older export
when Matt has supplied a newer rule or SVG.

## 2. Character

The interface should feel quiet, exact, warm, and intentional.

- Let type, position, whitespace, and muted color create hierarchy.
- Keep the portfolio flat and editorial; reserve elevation for floating controls.
- Prefer one decisive treatment over several decorative effects.
- Preserve the warm off-white/black light palette and the warm near-black/
  off-white dark palette, restrained grays, Helvetica Neue typography, and 4px
  spacing rhythm.
- Avoid generic SaaS styling, glassmorphism, and unnecessary nested cards.

## 3. Shape

- Use continuous squircle corners for every non-circular rounded element on the
  site. The shared implementation is `SiteSquircle`, backed by
  [`@squircle-js/react`](https://github.com/bring-shrubbery/squircle-js).
- Use a 16px corner-radius input and `0.6` corner smoothing for elevated control
  surfaces. This includes the AI composer, response, contact form, and
  `Send to Matt` button.
- The bottom navigation is the exception: the bar and its active tab are
  capsules, and the AI trigger is a true circle. See section 5 for the radii.
- Plain CSS `border-radius` is only the no-JavaScript/first-render fallback. It
  must not be the final rendered geometry for a rounded surface. The exception
  is a surface carrying an inset shadow, which is drawn against `border-radius`
  rather than the clip path and so needs a matching radius declared.
- True circles, capsules, the organic Bloub cloud silhouette, structural
  dividers, and accessibility focus outlines are deliberate exceptions. At
  radius = half the height there is no corner left to smooth, so a capsule or
  circle takes plain `border-radius` and skips `SiteSquircle`.
- A corner treatment defines geometry; it is not permission to add a solid
  border. Capsules belong to the navigation dock; do not spread them to
  buttons, fields, or content surfaces.

## 4. Elevation, not borders

Buttons and filled elements have no hard decorative border. Do not use a solid
stroke or wrapper layer that reads as an outline. When a floating surface needs
elevation, use a soft downward drop shadow:

```css
--filter-elevated: drop-shadow(0 4px 20px rgb(0 0 0 / 5%));
```

The 20px blur with a 4px downward offset supplies the quiet lift. Use shared
tokens; do not repeat these values in individual components.

Squircle clip paths clip ordinary outer `box-shadow`, so render outer elevation
with `filter: drop-shadow(...)` on the squircle surface, never as a wrapper
element drawn to look like a border.

Apply this treatment to floating composer and form surfaces and to contained
floating buttons, including the full-width email action. The navigation dock has
its own stack — see section 5.

Do not apply it to inline links, list dividers, field separators, the bare back
arrow, or static editorial content. Structural hairlines and focus outlines are
not decorative borders and should remain where required.

## 5. Buttons and navigation

- Buttons use direct, short labels.
- `Send to Matt` is full width and text only. It has no send icon.
- Icon-only buttons need an accessible label and a minimum 44×44px hit area.
- The AI back control is a 16px muted-gray Phosphor arrow inside a 44×44px hit
  target, with no drawn container.
- The bottom navigation is icon-only. Each tab is 60×40px inside one parent
  surface with a uniform 4px padding, making the bar 48px tall and
  `count × 60 + 8` wide. No visible caption sits under the icon; the label lives
  in an `sr-only` span so the tab still announces itself.
- Bar and active tab are capsules — radius is half the height, 24px and 20px.
  The AI trigger is a 48×48px circle, a separate sibling with an 8px dock gap.
- Every dock measurement derives from `--dock-tab-w`, `--dock-tab-h`,
  `--dock-pad`, `--dock-gap`, and `--dock-trigger`. The AI back row and the
  cloud's open-state travel read the same tokens, so the bar, the trigger, and
  the back arrow keep one centre line and one resize cannot drift them apart.
- The dock and the trigger share one shadow stack: a single soft drop shadow for
  lift, plus a 1px inner rim that draws the edge without a stroke.

  ```css
  --shadow-navigation: inset 0 0 1px 0 rgb(0 0 0 / 25%);
  --filter-navigation: drop-shadow(0 2px 10px rgb(0 0 0 / 5%));
  ```

- The recess is one pill for the whole bar, not a surface per tab, and it slides
  between columns over 250ms on the shared `--ai-ease` curve. The icon color
  transitions on the same clock so it arrives with the pill.
- The pill travels by `translateX` in multiples of its own width. The dock is a
  gapless equal-column grid, so one column width is exactly one step: the pill's
  box never changes, so only the compositable transform animates, and the active
  column is known during render — the server sends it already in place, so there
  is no measure-and-snap on first paint and no JavaScript in the path at all.
- Never animate a squircle surface's width or height. Clip-path regenerates on
  every frame and the corners crawl. Move it instead.
- A tap hops the icon 2px and back over 240ms and plays `tap.wav`. This replaced
  the per-letter hop across the old caption; with the caption gone the icon
  carries the same gesture.
- The active tab is the one internal element that carries its own shadow, and it
  is a recess, not a raised chip. Three inner layers, in paint order:

  ```css
  --shadow-navigation-active:
    inset 0 1px 10px 0 rgb(0 0 0 / 12%),
    inset 0 3px 2px 0 rgb(255 255 255 / 100%),
    inset 0 -2px 4px 0 rgb(255 255 255 / 100%);
  ```

  The black layer is the well. The two white layers are the bevel — a bright
  ledge under the top edge and a softer bounce off the bottom — so the tab reads
  as pressed into the bar rather than laid on top of it.

- Inset shadows are drawn against `border-radius`, never a clip path. A surface
  carrying one must own its geometry as `border-radius` alone — pairing an inset
  shadow with a squircle clip gives the same edge two slightly different shapes
  and the rim thins unevenly around the corner.
- Active navigation uses fill, foreground color, and this recess — never a
  heavier border.
- Keep a pointer-transparent gradient mask fixed behind the bottom navigation
  and above page content. It uses the same theme-aware fade colors as the AI
  overlay but a shorter `min(240px, 35dvh)` footprint so content stays legible
  without washing out the page. Hide it while AI is open; the taller AI mask
  takes over in the same frame.
- When AI opens, the navigation shell moves 12px left, blurs by at most 3px,
  and fades. The cloud moves to the horizontal center and stays there for every
  active AI state.

## 6. Icons and character

- Use [Phosphor](https://phosphoricons.com/) for interface icons.
- Choose the closest semantic icon and keep weight consistent within a group.
- Let text carry meaning when an icon would be redundant.
- The cloud is a branded character, not a Phosphor icon.
- Use the vendored [Bloub](https://github.com/jeremy-prt/bloub) cloud geometry,
  expressions, blink, and gaze model rather than a static raster imitation.
- The cloud may change among neutral, attentive, happy, angry, surprised, sad,
  and the other supplied Bloub expressions according to state.
- The cloud's active-state layout anchor does not wander. Only its expression
  and eyes animate.
- Eyes track the pointer. When the pointer is idle, gaze occasionally travels
  left and right and the expression may change subtly.

## 7. Surface relationships

- Preserve the 4px grid.
- Use exactly 8px between companion surfaces, including response/form and
  response/follow-up composer.
- Keep distinct objects separate when the approved design separates them.
- Avoid cards inside cards; prefer spacing, alignment, or a hairline.
- Shadows belong to the outer surface, not every internal row.

## 8. Color and type

- Use the existing background, foreground, muted, and divider tokens.
- Apply the theme universally and follow the operating system's light/dark
  preference. Navigation, AI controls, overlays, native controls, the cloud,
  browser chrome, and the scroll lens must switch together; do not leave an
  isolated light surface in dark mode.
- Use Helvetica Neue first, with Helvetica/Arial and the existing CJK fallbacks.
- Do not invent off-scale sizes or weights to create hierarchy.
- Elevated controls use the theme surface on its warm background without a
  solid border.
- AI response and contact surfaces stay neutral black in both themes; do not
  add an AI accent color or invert those approved surfaces in dark mode.
- Secondary copy and placeholders use the existing muted grays.
- Interface copy is compact, plain, sentence case, and specific.
- The AI speaks about Matt in the third person.
- Do not publish model, token, word, turn, quota, or chat-limit rules in the UI.

## 9. Motion

- Motion is quick, restrained, and spatially clear.
- Standard resizing uses `cubic-bezier(0.22, 1, 0.36, 1)`, around 300ms open
  and 240ms close.
- Ordinary content travel stays near 8px with at most 3px transient blur.
- Avoid decorative bounce, parallax, and persistent page movement.
- The active AI opening does not use a goo or liquid overlay. Keep the vendored
  [liquid-taffy](https://github.com/arknow91/liquid-taffy) experiment dormant
  until it can become the real shared surface without a layer swap.
- Opening is one 300ms synchronized handoff: navigation moves 12px left while
  fading and blurring by 3px; the cloud moves to center; the composer enters
  from 12px below while fading from 0 and resolving from 3px blur.
- Never animate a temporary approximation faster than the persistent cloud or
  replace it with the resting UI at the end. There must be no flash between
  animation and rest states.
- Reduced-motion mode removes the spatial morph and content blur. The AI
  character may retain subtle gaze/expression behavior because Matt approved it
  as the character exception.
- The scroll-lens refraction is off (`LENS_ENABLED` in
  `components/effects/SmoothScrollLens.tsx`). It never resolved into glass: it
  needs a raster of the page that matches the page to the pixel, and no DOM
  rasteriser gets there. Do not switch it back on to fix an unrelated problem.
  What separates the page from the navigation is the `.site-content-mask`
  gradient, and Lenis smooth scrolling is independent of both.
- Gallery images do not dim on hover; the caption carries it. That began as a
  lens constraint and stays on its own merit — a photograph dimming under the
  pointer reads as a state change, where a caption dimming reads as a target.

## 10. AI response completion

- Thinking and the intro's LinkedIn, Github, and email links share the same
  sunset shimmer palette. State-specific pause timing may differ.
- Let a response surface grow with its full text. Do not crop it, cap its visual
  height, or add internal answer scrolling; the 100-word product limit is the
  response bound.
- Do not show a border beam during thinking or streaming.
- After streaming completes, wrap the response in the real `border-beam`
  component using `size="line"`, `colorVariant="sunset"`, and the matching
  16px radius.
- The beam is a completion cue, not a general card treatment.
- The first completed answer reveals one full-width compact `Follow Up?`
  composer 8px beneath it. It grows from one to three 21px text lines, then
  scrolls vertically inside the field. A conversation runs to `MAX_AI_TURNS`
  questions. The last answer arrives without another prompt beneath it, and
  in that place a single line says the conversation is spent and offers the
  email handoff — the line is the way out, not a note beside one.

## 11. AI contact handoff

- The handoff never ends the conversation. The email form and the chat are two
  sides of one surface, and a control on the right of the bottom row crosses
  between them, level with the back arrow and the cloud. Its icon is the side
  you are not on: an envelope while chatting, a speech bubble while on the
  form. 24px, `--color-muted`, same as the back arrow.
- The answer is rendered once and stays mounted across the crossing, with only
  the half beneath it exchanged. That is what lets it travel to its new
  position instead of disappearing and reappearing somewhere else, and it is
  why it hugs its text in both states: two different heights leave nothing
  continuous to carry across.
- Crossing is a sideways exchange, `--ai-cross-travel`. The form leaves to the
  left and the follow-up arrives from the right; toggling back reverses both.
  The phase change waits out the exit, since unmounting on the same tick gives
  the outgoing half nothing to leave with, and the answer moves from where it
  was to where it now is over the standard 300ms.
- Unknown, private, and contact-only facts offer an email handoff.
- Keep 8px between the black response and form.
- Fields follow the latest `4.2` and `4.2.1` exports.
- The action reads exactly `Send to Matt`, spans the full surface width, and is
  text only.
- Email and note are submitted through the dedicated contact form, never through
  the model.

## 12. Review checklist

- [ ] Latest written instruction and latest `raw/` source were checked first.
- [ ] No hover state changes the appearance of anything the scroll lens
      refracts.
- [ ] Every non-circular, non-capsule rounded element uses `SiteSquircle`
      continuous corners; plain `border-radius` appears only as a fallback, or
      as the sole geometry on a capsule, a circle, or an inset-shadowed surface.
- [ ] Elevated surfaces use a 16px radius input, 0.6 smoothing, and no hard
      decorative border.
- [ ] Buttons and filled elements have no hard border or wrapper stroke.
- [ ] Floating surfaces use the shared 20px black-at-5% outer `drop-shadow`; the
      navigation dock uses its own rim, lift, and active-recess stack.
- [ ] The active-tab recess is a single pill that slides between columns by
      transform, correct on first paint without JavaScript measurement.
- [ ] Dock tabs are 60×40px inside 4px padding, the bar and pill are capsules,
      and the AI trigger is a 48px circle.
- [ ] Icon-only dock tabs still carry an `sr-only` label.
- [ ] Structural hairlines and focus states remain intact.
- [ ] General interface icons come from Phosphor.
- [ ] `Send to Matt` is full width, text only, and icon-free.
- [ ] Companion AI surfaces use the approved 8px gap.
- [ ] The short bottom content mask sits behind the navigation and yields to the
      taller AI mask without a gap or doubled fade.
- [ ] Typography starts with Helvetica Neue.
- [ ] Light and dark system themes switch the page, controls, overlay, cloud,
      browser chrome, and scroll lens together without a light-only flash.
- [ ] Navigation exits left with fade/blur and the cloud settles at center.
- [ ] Cloud expressions and gaze use the Bloub source behavior without moving
      the active-state anchor.
- [ ] The active opening uses no goo overlay: navigation, cloud, and composer
      share one 300ms handoff with no end-state flash.
- [ ] The sunset line beam appears only after a response completes.
- [ ] AI answers grow to their full content without cropping or internal scroll.
- [ ] The follow-up composer grows to three lines, then scrolls internally.
- [ ] No UI copy advertises model, token, word, turn, quota, or chat limits.
- [ ] The result still feels like Matt's portfolio rather than a generic AI UI.
