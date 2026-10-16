# Case study video player

- Status: built
- Requested: 2026-10-16

## Goal

Put screen recordings in case studies, starting with the Bowtie & JP Health
desktop and phone demos, with a control bar modelled on the Video.js v10 player
(videojs.org): a blurred strip floating inside the bottom of the frame.

## Decisions

- Zero-dependency `components/VideoPlayer.tsx` rather than the Video.js
  library: the site keeps its no-extra-libraries rule, and only the look is
  borrowed.
- Controls, left to right: play/pause, elapsed time, scrubber, time remaining,
  picture-in-picture (where the browser supports it), fullscreen.
- Left out from the reference: volume, because the recordings are silent;
  settings and cast, because there is nothing behind them; the "sponsored by"
  credit, which is Video.js's own.
- The frame and the bar are `SiteSquircle`s at 16px, not a capsule — capsules
  belong to the navigation dock. The bar sits 12px inside the frame, is 48px
  tall, and holds 44px buttons. It stays white on translucent black in both
  themes, because it sits on the video, not on the page.
- The video plays muted and looped while at least half of it is on screen and
  pauses when it leaves. Once the reader pauses, scrolling never restarts it.
  No autoplay under reduced motion.
- The bar hides 2s after the pointer stops while playing, fading and dropping
  8px over 240ms. It is always shown while paused or focused.
- Videos break out of the column at the same width as images.
- Authoring: `{% video src poster title /%}` in Markdoc, also available as a
  "Video" block in the Keystatic Experience editor. Files live in
  `public/videos/experience/<slug>/`, re-encoded to H.264 with the audio track
  removed and a first-frame WebP poster.
