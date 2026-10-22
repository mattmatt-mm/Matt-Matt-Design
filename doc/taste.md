# UI taste

- Status: authoritative design guidance
- Owner: Matt
- Updated: 2026-10-21

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
- **Uniform inset.** A control or surface nested in a corner of its container
  sits the same distance from every edge it is near: top, bottom and side
  alike. If the container's height leaves 8px above and below a button, the
  button is 8px from the side too, never 16px. Text keeps the text inset;
  only the nested control moves in. Current examples: the Notes copy button
  is 8px from the band's top, bottom and right; the video player's control
  bar is 12px from the frame's sides and bottom, and its 44px buttons 2px
  inside the 48px bar on every side. Matt flagged the copy button's 8px top against 16px right on
  2026-10-19.

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
- On a detail page (`/work/<slug>`, `/writing/<slug>`) the bar contracts,
  Dynamic Island style, into a 48px circle holding a 20px back arrow, beside
  the AI trigger. The arrow returns to the page the visitor came from, or to
  the page's list when they arrived from outside the site. The width morphs over 300ms on
  `--ai-ease` while tabs and pill fade out with 3px blur and the arrow
  resolves in. Detail pages are served contracted; only navigation animates.
  Matt asked for this on 2026-10-16. See `doc/dock-back-button-plan.md`.
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
- The masks behind the dock and the open AI are arcs, not flat bands (Matt,
  2026-10-18, after Dia's footer): a dome of `--color-bg` rising from the
  bottom edge, highest at the centre. It is one continuous fade with no flat
  core and no hard edge — solid only at the very bottom centre, thinning on a
  smoothstep (`--arc-fade`) all the way out to clear at the curve. Rejected
  along the way: a hard edge with a drop shadow, and a feathered edge around
  a flat 80% core, which read as unnatural.
  - Dock: ellipse 80% wide by 100% of a `min(120px, 16dvh)` strip.
  - AI: ellipse 80% wide by 100% of a `min(480px, 60dvh)` strip — tall enough
    that the row above the composer sits in the denser part and stays legible.
  It is one fade, not two: opening the AI grows the dock's arc into the AI's
  over the AI's open clock, and closing shrinks it back (Matt, 2026-10-18;
  swapping one fade for the other snapped). It stays above the travelling
  thumbnail during the gallery morph, as it is on the page.
- While the AI is open, the page under its arc is blurred as well as paled:
  a progressive blur, strongest at the bottom centre (about 9px) and gone
  before the curve, so the conversation reads over the page without a hard
  band (Matt, 2026-10-19). Four stacked `backdrop-filter` layers on the
  arc's own ellipse; it fades with the AI and is absent behind the dock.
- When AI opens, the navigation shell moves 12px left, blurs by at most 3px,
  and fades. The cloud moves to the horizontal center and stays there for every
  active AI state.

- The guided tour asks its pick question as a checklist, not chips — chips
  were one button too many (Matt, 2026-10-18). One squircle panel on the email
  form's surface (`--color-ai-form`), a 44px row per skill with the label left
  and a 20px Phosphor Square / CheckSquare (fill) right, the form's hairline
  between rows. Real checkboxes, hidden, with the focus ring drawn inside the
  row so the panel's clip cannot cut it.
- Its buttons are squircles under the response, 40px tall with the 8px
  companion gap, and flat — no shadow:
  - Primary (Accept, Walk me through, Continue, Start walkthrough): dark,
    on `--color-ai-action` — the one dark surface left in the AI.
  - Secondary (Decline, No thanks, Ask a question): the Notes copy button's
    fill, an 8% tint of the text colour mixed over the surface; 14% on hover.
    It is translucent (64%, 72% on hover) over a 10px backdrop blur, so it
    reads as frosted glass instead of a solid grey that can vanish into the
    page behind it (Matt, 2026-10-19).
  Not capsules — capsules stay with the dock. See `doc/hr-mode-plan.md`.
- The AI composer (Ask me anything, Follow up) wears the dock's stack: the 1px
  `--shadow-navigation` rim on the surface and `--filter-navigation` on a
  wrapper around it, since the squircle's clip path would cut a drop shadow off
  the surface itself (Matt, 2026-10-18). The row above it lines up with the
  field: "I'm hiring" starts at the text's 16px inset, the info icon centres on
  the send icon.
- Above the first-question composer: **I'm hiring** (Phosphor Briefcase,
  muted, fg on hover) on the left, and a 16px Phosphor Info button on the right
  whose tooltip carries the review notice. Do not print that notice as a line of
  text. Do not auto-focus a control when an AI surface appears unprompted — the
  focus ring reads as a stray frame. Matt asked for both on 2026-10-18.
- Start walkthrough opens with a splash: the pressed button swells a little,
  blurs and fades while the page background fades up over everything and the
  selected titles rise in on the page column, then the sheet
  wipes upward behind a soft feather while the eyebrow and first title glide
  onto the page's own. ~2.4s, skippable by tap or Escape, themed, off under
  reduced motion. Spec in `doc/hr-mode-plan.md`.
- After a walkthrough opens, the cloud speaks through the answer surface
  itself (`AiAnswer`: black squircle, 16px padding, sunset beam), 345px wide and
  centred like any answer, 8px above the dock — never a smaller one-off bubble. "Please enjoy.", then "You can change what's shown by pressing
  me.", then nothing. Asked for from inside the AI, the tour steps aside back
  to the conversation (No thanks / Ask a question) instead of closing it.
- On a walkthrough (`/tour/*`) the dock contracts exactly as on a detail page,
  but the circle holds a 20px Phosphor X that leaves the walkthrough for Home.

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
- AI answers, the tour checklist and the contact fields are light surfaces:
  white with black text and the elevated shadow (20px black at 5%, plus the
  1px rim) in light mode, warm off-white `#F3F1EC` with near-black text in
  dark mode (the form a step darker, `#E4E1DA`). Only the action buttons stay
  dark: black with white text in light mode, the off-white in dark mode.
  History: black in both themes, then black only in light mode
  (2026-10-18), then white in light mode with only the buttons dark (Matt,
  2026-10-19). The sunset beam is always its light variant. A squircle's
  drop shadow goes on a wrapper (`AiLift`), since its own clip path trims a
  filter. Do not add an AI accent color.
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
- Tappable objects press. A target scales to 0.98 while held and springs back
  over 120ms ease-out, via the shared `.press-shrink` class: gallery items,
  dock tabs, and experience rows all answer a tap the same way. Matt asked for
  this on 2026-09-06, and it does not reopen the rule above — a hover dim is a
  state the object sits in, where a press is a momentary acknowledgement that
  ends when the finger lifts.
- What presses is the whole target, never a part of it. A gallery item scales
  the link so picture and caption never separate; a dock tab scales the tab, not
  the sliding recess pill, which belongs to the bar rather than the tap. Only
  something that actually goes somewhere presses: a gallery entry with no case
  study behind it must not answer a tap like a target.
- The press stacks with what a target already does rather than replacing it. The
  dock tab keeps its icon hop and its colour paced to the pill, and keeps that
  pacing by declaring its own transition after `.press-shrink`; a row link keeps
  its hover dim. A row link is `inline-block` only so the transform applies at
  all. Removed under reduced motion.

- Case studies run on into each other, and so do writing posts. The end of one keeps scrolling into the
  next in list order, wrapping round. Matt asked for this on 2026-10-16. Never
  swap pages and reset the scroll to fake it; that cuts touch momentum.
- Between two case studies sits a gate, 128px below the previous case
  study with no hairline above it: a sticky muted "Next", the title, and a 1px progress line. The title holds for a screen of
  scrolling, drifting 48px while the line fills, then scrolls on with the
  content 24px beneath it — never an empty screen between title and content.
  The content enters on release with the shared open motion (fade, 3px blur
  to sharp, 8px up, 300ms) as the line fades on the same clock. The URL and
  tab title change only once the gate is passed. Friction is visual, never
  wheel or touch hijacking. See `doc/case-study-continuous-scroll-plan.md`.
- Case-study video follows the Video.js v10 player: a translucent black,
  blurred control strip floating 12px inside the frame. Frame and strip are
  16px squircles, not capsules. Only controls that do something appear — no
  volume on a silent recording. It plays muted while on screen and stops when
  it leaves; a reader's pause is final. See
  `doc/case-study-video-player-plan.md`.
- Case-study prose speaks human: what an interaction feels like and why,
  never "24px height, 4px between controls". The numbers live in a Notes
  card (Apple Notes style, yellow band, ruled paper, Copy prompt) written as
  a prompt to rebuild it. Matt asked for this on 2026-10-18; see
  `doc/case-study-voice.md`.
- Screen recordings are filed like a folder: a two-to-four-word caption on a
  line-grey tab at the top-left, an inside curve joining it to the recording,
  and the recording at full width. Matt drew this on 2026-10-18 after a
  padded backdrop frame made the video too small: never pad a recording
  inside a frame.
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
- Keep 8px between the response and form.
- Fields follow the latest `4.2` and `4.2.1` exports.
- The action reads exactly `Send to Matt`, spans the full surface width, and is
  text only.
- Email and note are submitted through the dedicated contact form, never through
  the model.

## 12. Reading width, section rail, view cursor and stats

Matt asked for these on 2026-10-17, taking the structure of a reference
portfolio but not its look. See `doc/reading-width-rail-cursor-stats-plan.md`.

- The column is 640px on every page. Hierarchy still comes from colour and
  position; the wider measure is not permission for larger type.
- A case study opens with a thumbnail up to 840px (whatever sits before the
  first section heading); imagery inside a section stays at the text's 640px.
- Motion exported from Matt's own tools (Lottie) plays as he made it, in his
  order, inside the site's frame — no added chrome around it.
- Detail pages carry a text-only section rail on the screen's left edge: muted
  sections, the current one in fg, no markers or boxes. It steps aside (3px
  blur fade) while breakout imagery passes beneath it rather than printing over
  a picture.
- The normal cursor stays. Only project targets turn it into a dot with a
  floating label on the elevated squircle surface: "View project" for a case
  study, "View website" for a link off the site, "Zoom" over a case-study
  image and "Close" over the zoomed view. Never on touch, never on ordinary
  links. The dot is 12px, inverts whatever is beneath it (a white dot under a
  difference blend, so it reads on dark images and in dark mode) and shrinks
  to 75% while the button is held, on the 120ms press-shrink clock. The label
  is centred on the dot and does not invert (Matt, 2026-10-18).
- Image zoom moves the image itself from the page to the window centre and
  back; it never cross-fades a second copy in.
- A home gallery card opens its case study by morphing its picture into
  the case study's thumbnail, on the image zoom's clock, while the page
  cross-fades. Matt asked for this on 2026-10-18. See
  `doc/thumbnail-morph-plan.md`.
- Explainers are drawn in the site's own type, tokens and hairlines, not
  pasted in as illustrated images. Matt rejected an orange flow-diagram image
  because it did not fit the portfolio's identity. The Stats block is the first
  of these: figure in fg, label muted beneath, 16/21 only.
- A point can carry a small line drawing above its title
  (`{% point figure="crowd" … /%}`, `components/PointFigure.tsx`). Matt
  supplied a colourful three-panel reference on 2026-10-17; we kept its
  structure (drawing, title, one line) and redrew it in fg, muted and the
  hairline colour on a 1px ground rule. No colour, no framed card.
- Antique engraving drawings (hatched, one ink, a creature standing on a
  rule, after JW Anderson references Matt shared on 2026-10-19) are allowed as
  rare ornament. They are drawn in fg only, on the page background. The same
  day Matt asked for the Hermes Task point figures in this style too, so
  explainers may be engraved: simple objects drawn by hand, with lines
  that waver, taper and swell, left open (never filled) and shaded only by
  hatching on the shadow side (`components/EngravedFigures.tsx`), still in
  fg, muted and the hairline colour. Both are covered in `doc/engraving-graphics.md`.
- Hermes Task’s three Problem graphics now use original generated ink scenes
  based on the accompanying copy (Matt, 2026-10-19): overflowing contact
  cards, a slipping follow-up note, and a tired person with a closed laptop
  and a phone message. Do not use the previous graphics as visual references.
  These explainers now animate once on viewport entry, then hold their final
  frame. Reduced motion keeps that final frame. An SVG ink filter follows the
  theme foreground colour; all three may appear in the Drawn point row.

- Illustration interiors must remain transparent in both themes (Matt,
  2026-10-19). Use foreground-coloured ink; do not keep white or cream fills
  or rely on raster inversion. See `doc/illustration-animation-workflow.md`
  for the 404 tree’s ink filter.

- Comments from clients and users travel below the Experience list (Matt,
  2026-10-21, after Wispr Flow's testimonial wall). Wispr was a reference for
  the motion only; the card is Matt's: theme surface, elevated drop shadow,
  16px squircle, half-star rating, the words as written, a hairline, a 40px
  logo or initials tile with name and muted role. No section heading (Matt
  removed "Kind words"). The cards run along one straight diagonal, bottom
  left to top right, while the section stays pinned. The motion is linear, with
  position tied directly to scroll and no easing or lag. A card is square at
  the centre and shears as it leaves. Neighbours keep a 128px gap between
  their edges at every width, never closer. This is the one sanctioned
  scroll-linked motion besides the chain gate. See
  `doc/profile-comments-plan.md`.

- Fun (Matt, 2026-10-23, after a hackathon portfolio grid and a file
  inspector view of one poster): side work as a masonry wall that breaks out
  to 1200px, three columns, two on a phone, under the name alone — no
  intro. Filters are text links in the
  column, active in fg, never filled chips — the site has no accent colour.
  A tile morphs into its piece's page, like a gallery card into a case
  study, and the dock contracts to the back arrow. That page is the work
  centred with its colours as 32px dots on the left and its details on the
  right, label in fg and value muted, in Helvetica at 16/21 — the
  reference's uppercase monospace was declined. A piece with more than one
  picture is a stack on the wall: its next two peek above the cover and fan
  out to either side under the pointer — the one place a wall picture moves
  on hover, because Matt asked for it to reveal more of the set. See
  `doc/fun-tab-plan.md`.

## 13. Review checklist

- [ ] Latest written instruction and latest `raw/` source were checked first.
- [ ] No hover state changes the appearance of anything the scroll lens
      refracts.
- [ ] Gallery items, dock tabs, and experience rows press to 0.98 on `:active`
      via `.press-shrink`, on linked targets only, never under reduced motion,
      and without flattening the dock's paced colour or a row's hover dim.
- [ ] Every non-circular, non-capsule rounded element uses `SiteSquircle`
      continuous corners; plain `border-radius` appears only as a fallback, or
      as the sole geometry on a capsule, a circle, or an inset-shadowed surface.
- [ ] Elevated surfaces use a 16px radius input, 0.6 smoothing, and no hard
      decorative border.
- [ ] A control nested in a corner is inset equally from each edge it is
      near (Notes copy button: 8px top, bottom and right; video bar buttons
      2px all round).
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
- [ ] The bottom content mask sits behind the navigation and grows into the
      AI's taller arc (and back) rather than swapping.
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
