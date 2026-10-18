# mattmattdesign.com — Agent Guide

Personal site for Matt (Design Engineer). Source design: `raw/Experience.svg`, `raw/Gallery.svg`, `raw/Writing.svg`, `raw/Signature.svg`.
Render them to inspect: `qlmanage -t -s 1400 -o <outdir> raw/Gallery.svg`

Full build plan: `~/.claude/plans/wild-riding-tome.md`

Matt is a designer, not an engineer. He edits content through a UI, never a terminal.

## Feature plans

Store every new feature plan as Markdown in `doc/`. Do not add new feature plans
to the repository root or to a user-level plans directory. Existing historical
plans outside `doc/` remain reference material only.

Read `doc/taste.md` before proposing, designing, or implementing interface work.
It records Matt's durable UI taste decisions. A newer explicit instruction from
Matt overrides that file and should be folded back into it.

Every non-circular rounded UI element uses the shared `SiteSquircle` component
from `components/SiteSquircle.tsx` (16px radius input and 0.6 smoothing by
default). CSS `border-radius` is fallback geometry only. Preserve true circles,
capsules, the organic cloud silhouette, structural hairlines, and focus
outlines. A capsule, a circle, or any surface carrying an inset shadow owns its
geometry as `border-radius` alone — there is no corner left to smooth, and a
clip path would disagree with the radius the inset shadow is drawn against.

---

## Stack

Next.js 15 (App Router, TS) · Tailwind v4 (`@theme`) · Keystatic (git storage) · `next/image` · Vercel · pnpm.

Not using: databases, i18n routing, state libraries, animation libraries — the
exceptions are `gradient-shimmer`, a zero-dependency component used solely for the
intro links (see Interaction), and `lottie-web` (light SVG build), loaded on demand
only by `components/LottieSequence.tsx` to play Matt's Lottie exports, and
`posthog-js`, loaded on demand only by `lib/analytics.ts` after a visitor opts in
through the guided tour (HR mode).

---

## Design system

**Tokens live in `app/globals.css`. No hardcoded hex or px in components.**

### Color
| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-bg` | `#FDFDFC` | `#12110F` | Page background |
| `--color-fg` | `#000000` | `#F3F1EC` | Primary text, active tab, cloud body |
| `--color-muted` | `#A0A0A0` | `#96938B` | Role line, row labels, inactive tabs, caption sub |
| `--color-line` | `#D9D9D9` | `#383631` | Hairlines, dividers, image placeholder |
| `--color-surface` | `#FFFFFF` | `#1C1B18` | Navigation, trigger, and composer surfaces |

The entire site follows the operating-system theme through
`prefers-color-scheme`; native controls and browser chrome advertise both
schemes. There is no separate saved preference or theme toggle. AI response and
contact surfaces are the inverse of the page: black in light mode, warm
off-white (`#F3F1EC`, near-black text) in dark mode, so they always stand off
the background. Matt changed this from black-in-both on 2026-10-18.

### Type
- **Helvetica Neue** is the primary interface face, with Helvetica, Arial, and the existing CJK system faces as fallbacks. The full stack lives in `--font-sans` in `app/globals.css`.
- **16px / 21px** everywhere. Keep the established line box and do not create hierarchy with off-scale type.
- `32px / 42px` for detail-page headings — the only second size.
- Pixel fonts must render at multiples of their design size. Never 15px, 17px, rem fractions, or `clamp()` on text.
- Hierarchy comes from **color and position**, never scale or weight.
- Chinese body copy gets `28px` leading (`.prose-zh`, `.leading-cjk`) — 1.6 would land on 25.6px and break the grid.

### Spacing
Scale: `4 8 12 16 24 32 48 60 64 96 128`. Nothing off-scale — the two documented exceptions are the 21/42px line boxes and the signature's 5px optical offset.

### Layout — all values measured from `raw/*.svg`, not guessed
- Content column **640px** on every page, centered (`--container-column`). `24px` inline gutters below 688px (`--breakpoint-column`, the column plus both gutters), none above. Matt widened it from 500px on 2026-10-17.
- Page padding: top `60`, bottom `128`.
- Header → intro `60`. Intro paragraph gap `16`. Intro → tab bar `60`.
- Tab bar: `12` top padding, label, `12` bottom padding, `1px` `--color-line` rule. Each tab has `4px` horizontal padding and tabs are `8px` apart; the active tab's `2px` fg marker spans the **padded** box and overlaps the hairline.
- List row: `12` top padding, `21` line, `12` bottom padding, `1px` divider = **46px pitch**. Label column **100px**.
- The divider is **inset to the title column** between rows of the same group and runs **full width** before a row that starts a new group. No divider after the last row.
- A label prints only on the **first row of its group**. It is absolutely positioned, so a label that wraps to two lines overhangs the rule instead of growing the row.
- **The two-column row never stacks.** Category left, title right, at every width including mobile — the 100px label column and the inset rule are fixed, and only the title column narrows. Do not add a breakpoint that collapses it.
- Gallery item: image → `12` → caption → project name (two 21px lines) → `12` → next item. Pitch with a 5:3 image (640×384) is exactly 450px.
- **A case study's thumbnail is the one thing that leaves the column.** Whatever sits before the first `##` heading — an image, a video or a Lottie sequence — opens the page at `min(840px, 100vw - 48px)`, centred on the 640px measure and inside the 24px gutters on a phone. Images, video and animation inside a section sit at the text's own 640px. Use symmetric negative margins, never a transform. To make an image the thumbnail, move it above the first heading.
- Signature: `101×32`, `mt-[5px]` — optical alignment to the name's x-height, exempt from the grid.

Verify changes against the export by measuring the live DOM (`getBoundingClientRect`) rather than eyeballing screenshots; `raw/*.svg` glyph positions are exact.

### Interaction
- Links underlined, `text-underline-offset: 2px`, `text-decoration-color: --color-line`, hover → fg. `120ms ease-out`, color only.
- Row hover: title `opacity: .6`. No fills, shadows, or scale.
- Tabs are **real links**, not client toggles. Left to right: **Home** `/` (the Gallery, house icon), **Writing** `/writing`, **Profile** `/profile` (the Experience list, person icon). Matt reordered them on 2026-10-17; `/gallery` permanently redirects to `/` (`next.config.ts`).
- The bottom dock is icon-only: `60×40` tabs inside `4px` padding, so the bar is `188×48`, capsule ends (`24px` / `20px` radius), beside a `48px` circular AI trigger with an `8px` gap. Sizes derive from the `--dock-*` tokens in `app/globals.css`; the AI back row reads the same tokens to hold one centre line.
- On a detail page (`/work/*`, `/writing/*`) the bar contracts like a Dynamic Island into a `48px` circle holding a back arrow, beside the AI trigger. The arrow steps back to the previous page when the visitor came from within the site, and otherwise links to the list (`/profile` or `/writing`). Width morphs over `300ms`; the route is resolved during render, so detail pages ship contracted.
- The active tab is one pill that slides between columns in `250ms`, moved by `translateX` in multiples of its own width. The column index is resolved during render, so the server ships it in position — no measurement, no first-paint snap.
- Tapping a tab hops the icon up `2px` and back over `240ms` and plays `public/sounds/tap.wav` at volume `0.5`. CSS keyframes on `transform`; no animation library. The hop honours `prefers-reduced-motion`; the icon is `aria-hidden` with an `sr-only` label beside it so the tab is announced once.
- The intro links (LinkedIn, Github, email) and AI Thinking text share the same
  sunset gradient sweep from `components/effects/SunsetShimmer.tsx`. The intro
  links run one sweep on a visitor's **first** landing — the
  `mmd:intro-shimmer-seen` localStorage key silences it forever after; clear that
  key to see it again — and loops while the pointer rests on a link. Hovering out
  waits for the sweep in progress to finish rather than cutting a gradient off
  mid-word. Skipped entirely under `prefers-reduced-motion`. The shimmer span is
  forced back to `display: inline` so the link's underline is not lost.
- Focus: `outline: 1px solid var(--color-fg); outline-offset: 2px`. Never removed.
- Over a project target (gallery links and Experience rows) the pointer becomes a 12px dot that inverts what is beneath it (difference blend) and shrinks to 75% while pressed, with a floating label on a squircle surface: "View project" for a case study, "View website" for a link that leaves the site. Fine hover-capable pointers only; touch never sees it (`components/effects/ViewCursor.tsx`, labels set by `data-cursor`).
- Every case-study and post image zooms on click, Enter or Space (`components/effects/ImageZoom.tsx`): the image travels from its place to the centre of the window over `--ai-open-dur` on `--ai-ease`, as large as the window allows inside the 24px gutter and never past its own pixels, while the page dims behind it. Click anywhere or Escape travels it back. The cursor reads "Zoom" over an image and "Close" over the open view. Reduced motion: no travel.
- Detail pages carry a section rail: the current entry's `##` headings pinned to the screen's left edge (24px in), muted, with the section being read in fg. It follows the detail chain and fades out while breakout imagery passes beneath it (`components/SectionRail.tsx`).
- Case studies can play Lottie exports in order and loop them with the Lottie sequence block (`{% lottie %}{% clip src /%}…{% /lottie %}`; files in `public/lottie/`). It loads when near the screen, pauses off screen, and under reduced motion holds the last clip's final frame. Re-encode embedded PNGs to WebP before adding a file (Kedonia's went from 3.9MB to 670KB).
- Case studies and posts can set out figures with the Stats block (`{% stats %}{% stat value label /%}{% /stats %}`): figure in fg, label muted, 16/21 only.
- Opening a case study from a home gallery card morphs the card's image into the case study's thumbnail over `--ai-open-dur` (View Transitions, `components/effects/ThumbnailMorph.tsx`); the rest of the page cross-fades. Forward only; skipped under reduced motion. Matt asked for it on 2026-10-18.
- **HR mode** (`doc/hr-mode-plan.md`): about a second after a first visit, the AI opens on its own, asks for cookies (Decline / Accept, asked until answered), then offers a guided tour — No thanks / Walk me through, then a Branding · UI/UX · Frontend development checklist ("I'm hiring" above the composer reopens it), then "Start walkthrough" to `/tour/<focus>`, the case-study chain filtered to the chosen disciplines. On a walkthrough the dock is contracted as on a detail page, with an X that exits to Home; the cloud says "Please enjoy." then "You can change what's shown by pressing me." in a bubble, and pressing it reopens the checklist over any existing conversation. Offered at most once every 24 hours per browser, counted from when it appears (`mmd:tour-offered` holds the time); `?tour` on any URL offers it again. The checklist is one squircle panel on the email form's surface (`components/ai/AiTour.tsx`).
- Engagement tracking is PostHog, consent-gated: nothing loads until **Accept** on the AI's cookie question (remembered as `mmd:tracking` = `granted`/`denied`), then pageviews, autocaptured clicks, heatmaps, masked session replays and named events (`tour_*`, `walkthrough_message_shown`, `case_study_viewed`, `ai_question_asked` with the question text, `contact_sent`; full list in the plan). `?ref=<name>` tags a visitor. Routed through `/ingest` (`next.config.ts`). Needs `NEXT_PUBLIC_POSTHOG_KEY`; without it every call is a no-op.
- Start walkthrough plays a ~2.4s splash (`components/ai/WalkthroughSplash.tsx`): the pressed button swelling, blurring and fading as the page background fades up and the selected titles rise in, then a feathered upward wipe while the eyebrow and first title glide onto the page's own. Tap or Esc skips; none under reduced motion. Matt asked for it on 2026-10-18.
- No other page transitions, scroll effects, or parallax. The one exception: a case study or writing post scrolls on into the next one through a sticky "gate" banner whose progress line fills with the scroll, and the URL follows once it is passed (`components/DetailChain.tsx`, `.chain-gate`). The page itself only ever moves with the reader's scroll.

### Responsive
The page gutters switch at `688px` — `24px` inline padding below it, none above. Row structure is identical at all widths (see Layout). Two component-level exceptions: a Stats block stacks below 640px, and the section rail only appears from 1104px, where it clears the 640px text by 48px (it steps aside while an 840px thumbnail passes beneath).

---

## Architecture

```
app/
  layout.tsx                            fonts, metadata defaults
  (site)/layout.tsx                     Header + Intro — shared, must not remount
  (site)/page.tsx                       /          Home: the Gallery
  (site)/profile/page.tsx               /profile   Experience list
  (site)/writing/page.tsx               /writing
  work/[slug]/page.tsx                  experience detail
  tour/[focus]/page.tsx                 HR-mode walkthrough — the chain filtered by discipline, noindex
  writing/[slug]/page.tsx               writing detail
  keystatic/[[...params]]/page.tsx      admin UI
  api/keystatic/[...params]/route.ts    admin API
  sitemap.ts · robots.ts · feed.xml/route.ts
components/  Column Header Intro PageSlide RowList GalleryList Prose Signature ShimmerLink SiteSquircle Demo VideoPlayer DetailChain ChainGate SectionRail Stats
             ai/ — AIExperience (mounted in app/layout.tsx) wraps AiDock, the icon+label bottom navigation
             effects/ — includes ViewCursor, the dot + "View project" cursor (mounted in app/layout.tsx)
lib/content.ts                          the ONLY module that reads content
content/     experience/ gallery/ writing/ settings.yaml
public/images/
keystatic.config.ts
```

Rules:
- The Header + Intro block is byte-identical across all three tabs and **must not shift** when switching.
- Everything statically generated; `generateStaticParams` on both detail routes.
- Server components unless interactivity demands otherwise.
- Drafts hidden when `VERCEL_ENV === 'production'`, visible on previews.

---

## Content model (Keystatic collections)

**experience** — `title` (slug), `label`, `order`, `start?`, `end?`, `role?`, `team?`, `hasPage`, `externalUrl?`, `disciplines` (`branding` | `uiux` | `frontend`, multiselect — which tour checklist rows find it; never shown; values in `lib/disciplines.ts`), `summary`, `cover?`, `body` (markdoc). These print under the title on the case-study page as Timeline (`start – end`, e.g. "Sep 2025 – Feb 2026"), Role and Team figures; any that are empty are left out.

Case-study prose describes what an interaction feels like, never its measurements; exact numbers go in a Notes module written as a copyable AI prompt — read `doc/case-study-voice.md` before writing case-study copy. Case studies are built from named modules — `doc/case-study-modules.md` is the vocabulary Matt uses to ask for them (Stat row, Point row, Drawn point row, Step comparison, Framed recording, …); keep it current. Screen recordings take a `caption` (two to four words) and are filed under it as a folder tab, the recording at full width (Framed recording). The HKUST AIS thumbnail is the ISD dot hero (`{% isd-hero /%}`, `components/isd/`), a canvas animation; its data is packed into `public/isd/hero.json` by `scripts/pack-isd-hero.py` and tuned on the unlinked `/lab/isd-hero` review page. Case studies follow `doc/case-study-structure-plan.md`: a muted `####` eyebrow (Overview, Problem, …) directly above a `##` claim heading that says what the section concludes; the section rail lists the eyebrows. Body blocks: Stats, Points (`{% points %}{% point title text figure? /%}`, where `figure` is a token-drawn line drawing from `components/PointFigure.tsx`), Step comparison (`{% flows outcome note %}{% flow title steps="a | b" /%}`), Lottie sequence, Video.
**gallery** — `caption` (slug), `projectName`, `image?`, `alt`, `date` → `content/gallery/*.yaml`
**writing** — `title` (slug), `lang` (`en`|`zh`), `publishedAt`, `draft`, `body` (markdoc). There is no writing `label`: the Writing list labels each post with its publish month ("26 Aug", from `monthLabel` in `lib/content.ts`), so posts from the same month form one group. Matt replaced the season labels on 2026-10-17.
**settings** (singleton) — `name`, `role`, `intro[]`, `socials[]`, `email` → **`content/settings.yaml`** (no trailing slash on the singleton path means a file, not a directory)

There is no `group` field. Grouping is derived in `lib/content.ts`: consecutive entries sharing a `label` form a group, only the first keeps the visible label, and the rule before a new group runs full width.

`label` is a list-only category. It never appears on a detail page.

Gotchas:
- Quote numeric labels in frontmatter (`label: "2026"`), or YAML parses them as numbers and Keystatic rejects the entry.
- Chinese titles produce empty auto-slugs — the slug field must be typed by hand.
- Keystatic bundles its own copy of Markdoc, so the body node needs one cast to `@markdoc/markdoc`'s `Node`. That cast lives in `lib/content.ts` and belongs nowhere else.

---

## Build order

1. Scaffold + tokens (verify before any component)
2. Fonts + CJK fallback
3. **Static shell** — hardcoded copy, pixel-matched to `raw/*.svg` at 1280px, no CMS
4. Keystatic + `lib/content.ts`, migrate copy into `content/`
5. Detail pages + `Prose`
6. Responsive, focus, metadata, sitemap, RSS, alt audit
7. Ship

Do not merge steps 3 and 4.

---

## Verify before calling anything done

- Measure the live DOM at 1280px against the numbers in the Layout section above — the column lands at x=320 and is 640px wide; rows keep a 46px pitch (with the current intro copy, row tops 454/500/546/…, dividers 499/545/…).
- Switch tabs — the masthead must not move by a single pixel.
- 375px — no horizontal scroll, labels stack above titles, dividers run full width.
- `pnpm build` — zero type errors, all detail routes prerendered.
- Keyboard tab-through — visible focus ring on every link.

**Never run `pnpm build` while `pnpm dev` is running.** They share `.next`, and the build wipes it out from under the dev server, producing a cascade of bogus `Cannot find module './NNN.js'` errors. Stop the dev server, build, then restart.

The build succeeds without the `KEYSTATIC_*` vars — `app/api/keystatic/[...params]/route.ts` builds its handler on first request precisely so that missing CMS credentials cannot fail the public site's build. Do not move that construction back to module scope.

Storage is GitHub in every environment. `pnpm dev` with no credentials serves the setup wizard at `/keystatic/setup`, which creates the GitHub app and writes `.env`. `KEYSTATIC_STORAGE=local pnpm dev` edits files on disk with no GitHub account involved.

---

## Deploy

Vercel + GitHub auto-deploy. Cloudflare DNS: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`, both **DNS-only (grey cloud)** — the orange cloud breaks cert issuance. SSL/TLS **Full (strict)**.
