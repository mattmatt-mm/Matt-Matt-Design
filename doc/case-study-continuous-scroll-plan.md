# Case study continuous scroll

- Status: built
- Requested: 2026-10-16

## Goal

Reaching the end of a case study keeps scrolling straight into the next one.
The address bar changes to the next case study at the same time, without a page
load, and nothing moves on its own: the page only travels under the visitor's
finger or wheel, bottom to top, like any other scroll.

## Approach

- A case study page renders the whole tour: the requested case study first,
  then every other case study in list order, wrapping round after the last.
  The tour stops once it reaches the one before the start, so each case study
  appears once and the page still has an end ("Back to Experience").
- Because the next case study is already in the page, there is no swap and no
  scroll reset. A swap would kill touch momentum on iOS, which is exactly the
  "follow the finger" feeling the request asks for.
- Each case study after the first opens with a gate: 128px below the
  previous case study (no hairline — Matt removed it), a sticky title block (muted "Next", the title, a 1px progress
  line) followed by a one-screen spacer. The title sticks at 40% of the
  viewport and holds while the reader scrolls that screen, drifting 48px up
  into its resting place as the line fills — that is the friction. When the
  spacer runs out, the title scrolls on at normal speed with the case study
  24px beneath it, so there is no empty screen between heading and content.
- The content stays hidden during the push. On release it enters with the
  shared open motion — opacity, `--ai-blur` (3px) to sharp, and
  `--ai-travel` (8px) up into place over 300ms on `--ai-ease` — while the
  progress line fades out on the same clock. Scrolling back into the gate
  reverses both on the 240ms close timing. Content is hidden only once the
  script has run (`data-chain="ready"`), so nothing is lost without it.
  Reduced motion keeps the fade and drops the blur, travel and drift.
  (Revised twice on 2026-10-16 at Matt's request: first for a clearer
  separation than a 128px gap and a "Next" line, then to remove the empty
  screen the full-height banner left under the title.)
- `components/DetailChain.tsx` watches the scroll, writes each gate's
  `--gate-progress` (0–1), and hands the URL (`history.replaceState`) and
  `document.title` to a case study once its gate is fully passed. Scrolling
  back into the gate hands them back. Replace, not push, so Back still returns
  to the list.
- The first title stays the page's `h1`; following titles are `h2` at the same
  size, so the document outline stays honest.
- Next images lazy-load, so the extra case studies cost little until reached.

## Writing

Writing posts use the same tour (2026-10-16): every visible post, newest
first as on the Writing list, wrapping round, through the same gate and
reveal. The shared pieces are `components/DetailChain.tsx` (takes a
`basePath`, `/work` or `/writing`) and `components/ChainGate.tsx`; the
tours come from `getCaseStudyTour` and `getWritingTour` in `lib/content.ts`.
A Chinese post's gate title carries `lang="zh-Hant"`.

## Out of scope

- No snap, scroll hijacking, or wheel throttling. The friction is visual: the
  page still moves exactly with the reader's scroll, so touch momentum and
  smooth wheel scrolling are untouched.
