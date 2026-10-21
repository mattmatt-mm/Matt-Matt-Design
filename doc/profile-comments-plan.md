# Profile comments — floating section

- Status: built
- Asked for: Matt, 2026-10-21
- References: Matt's three-card mock (Niket / Edmond / Yolanda, the real
  comments) and a 1.8s screen recording of Wispr Flow's testimonial wall.

## What it is

A section below the Experience list on `/profile` where comments from clients
and users float in the space around the column. Each comment is a card: a
star rating, the comment in the person's own words, a hairline, then a logo or
initials beside a name and a muted role line.

## What the recording shows (frame by frame, 60fps, 1.77s)

- The cards are not on a grid. They are scattered at different heights, partly
  off the screen edges, on a breakout wider than any text column.
- They move with the scroll, but not at the scroll's speed: each travels at its
  own rate, so they slide past each other, and they drift sideways a little as
  they rise (the green card moves right about 40px across a screen of travel).
- While the page is moving they lean — the card shears in the direction of
  travel, its bottom edge trailing — and as the scroll slows they straighten.
  In the last frames, with the scroll almost stopped, the cream card is square
  again while the faster green one is still settling. The lean is a reading of
  velocity, not of position.
- Nothing moves when the page does not. There is no idle animation.

## How we keep it Matt's

- The recording and the Wispr screenshot are references for the motion only.
  The card look comes from Matt's mock: the theme surface with the elevated
  drop shadow, a 16px squircle, 16/21 type only, hierarchy by colour.
- No heading. Matt removed "Kind words" on 2026-10-21.

## Motion (revised 2026-10-21)

Matt drew the path on a Wispr screenshot: one straight line, bottom left to
top right, and asked for the animation to be linear.

- The section grows by the track's length and a full-bleed view pins to the
  screen. The cards sit on one diagonal through its centre, one step apart.
- Scroll moves them along it linearly: position follows the scroll one to one,
  with no easing and no lag. The first card starts at the centre when the
  section pins, and the last card reaches the centre when it releases.
- A card is square at the centre and shears (skewX) in proportion to its
  distance from it, up to 8° one step out, as the side cards do in the
  screenshot.
- 28° above horizontal at every width. Neighbouring cards keep 128px of
  clear space between their edges, measured across: Matt measured about
  133pt on Wispr Flow at both desktop and phone widths, and 128 is the nearest
  step on the scale. The step along the slope is the card's width plus that
  gap, divided by cos 28°. On a phone the neighbours sit mostly off screen,
  as on Wispr. (Before 2026-10-21 the step shrank with the viewport and
  narrow panes crowded the cards.)
- Under reduced motion, or without JavaScript, nothing pins and the cards
  stack in the column.

The first version had the cards drift at different speeds, ease toward their
targets and lean with scroll velocity. Matt replaced it with the linear track.

## Content

Keystatic collection **Comments** → `content/comments/*.yaml`: name (slug),
role line, comment (multiline; line breaks are kept), rating (optional, half
stars), logo (optional image) or initials, order. Logos live in
`public/images/comments/`.

The Neardeal and Kedonia logos were cut from the mock at 120px. Replace them
with the original files through Keystatic when convenient.
