# mattmattdesign.com — Agent Guide

Personal site for Matt (Design Engineer). Source design: `raw/Experience.svg`, `raw/Gallery.svg`, `raw/Writing.svg`, `raw/Signature.svg`.
Render them to inspect: `qlmanage -t -s 1400 -o <outdir> raw/Gallery.svg`

Full build plan: `~/.claude/plans/wild-riding-tome.md`

Matt is a designer, not an engineer. He edits content through a UI, never a terminal.

---

## Stack

Next.js 15 (App Router, TS) · Tailwind v4 (`@theme`) · Keystatic (git storage) · `next/image` · Vercel · pnpm.

Not using: databases, i18n routing, state libraries, animation libraries — the one
exception is `gradient-shimmer`, a zero-dependency component used solely for the
intro links (see Interaction).

---

## Design system

**Tokens live in `app/globals.css`. No hardcoded hex or px in components.**

### Color
| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#FDFDFC` | Page background |
| `--color-fg` | `#000000` | Primary text, active tab |
| `--color-muted` | `#A0A0A0` | Role line, row labels, inactive tabs, caption sub |
| `--color-line` | `#D9D9D9` | Hairlines, dividers, image placeholder |

Light mode only.

### Type
- **Geist Pixel** (`@fontsource/geist-pixel`, Latin-only, weight 400) via `next/font/local`.
- CJK glyphs fall through per-character to `"Noto Sans TC", "PingFang TC", "Microsoft JhengHei"`. The whole chain lives in `--font-pixel`; do not add a `fallback` list in `app/fonts.ts` (next/font splices a generic `monospace` ahead of the CJK faces).
- **16px / 21px** everywhere. 21px is Geist Pixel's own auto line height — measured off the Figma export, where cap-top to cap-top is exactly 21.0px. It is a font metric, not a spacing decision, so it is not on the 4px grid.
- `32px / 42px` for detail-page headings — the only second size.
- Pixel fonts must render at multiples of their design size. Never 15px, 17px, rem fractions, or `clamp()` on text.
- Hierarchy comes from **color and position**, never scale or weight.
- Chinese body copy gets `28px` leading (`.prose-zh`, `.leading-cjk`) — 1.6 would land on 25.6px and break the grid.

### Spacing
Scale: `4 8 12 16 24 32 48 60 64 96 128`. Nothing off-scale — the two documented exceptions are the 21/42px line boxes and the signature's 5px optical offset.

### Layout — all values measured from `raw/*.svg`, not guessed
- Content column **500px**, centered. `24px` inline gutters below 640px, none above.
- Page padding: top `60`, bottom `128`.
- Header → intro `60`. Intro paragraph gap `16`. Intro → tab bar `60`.
- Tab bar: `12` top padding, label, `12` bottom padding, `1px` `--color-line` rule. Each tab has `4px` horizontal padding and tabs are `8px` apart; the active tab's `2px` fg marker spans the **padded** box and overlaps the hairline.
- List row: `12` top padding, `21` line, `12` bottom padding, `1px` divider = **46px pitch**. Label column **100px**.
- The divider is **inset to the title column** between rows of the same group and runs **full width** before a row that starts a new group. No divider after the last row.
- A label prints only on the **first row of its group**. It is absolutely positioned, so a two-line label ("26 / Spring") overhangs the rule instead of growing the row.
- **The two-column row never stacks.** Category left, title right, at every width including mobile — the 100px label column and the inset rule are fixed, and only the title column narrows. Do not add a breakpoint that collapses it.
- Gallery item: image → `12` → caption → project name (two 21px lines) → `12` → next item. Pitch with a 500×300 image is exactly 366px.
- Signature: `101×32`, `mt-[5px]` — optical alignment to the name's x-height, exempt from the grid.

Verify changes against the export by measuring the live DOM (`getBoundingClientRect`) rather than eyeballing screenshots; `raw/*.svg` glyph positions are exact.

### Interaction
- Links underlined, `text-underline-offset: 2px`, `text-decoration-color: --color-line`, hover → fg. `120ms ease-out`, color only.
- Row hover: title `opacity: .6`. No fills, shadows, or scale.
- Tabs are **real links** (`/`, `/gallery`, `/writing`), not client toggles.
- Tapping a tab hops each letter up `2px` and back — `240ms` per letter, staggered so the whole word lands in `480ms` at any length — and plays `public/sounds/tap.wav` at volume `0.5`. CSS keyframes on `transform`; no animation library. The hop honours `prefers-reduced-motion`; the letters are `aria-hidden` with an `sr-only` label beside them so the word is announced once.
- The intro links (LinkedIn, Github, email) get a `sunrise` gradient sweep from
  `gradient-shimmer`. It runs one sweep on a visitor's **first** landing — the
  `mmd:intro-shimmer-seen` localStorage key silences it forever after; clear that
  key to see it again — and loops while the pointer rests on a link. Hovering out
  waits for the sweep in progress to finish rather than cutting a gradient off
  mid-word. Skipped entirely under `prefers-reduced-motion`. The shimmer span is
  forced back to `display: inline` so the link's underline is not lost.
- Focus: `outline: 1px solid var(--color-fg); outline-offset: 2px`. Never removed.
- No page transitions, scroll effects, or parallax.

### Responsive
One breakpoint: `640px`, and it only governs the page gutters — `24px` inline padding below it, none above. Row structure is identical at all widths (see Layout).

---

## Architecture

```
app/
  layout.tsx                            fonts, metadata defaults
  (site)/layout.tsx                     Header + Intro + TabBar — shared, must not remount
  (site)/page.tsx                       /          Experience list
  (site)/gallery/page.tsx               /gallery
  (site)/writing/page.tsx               /writing
  work/[slug]/page.tsx                  experience detail
  writing/[slug]/page.tsx               writing detail
  keystatic/[[...params]]/page.tsx      admin UI
  api/keystatic/[...params]/route.ts    admin API
  sitemap.ts · robots.ts · feed.xml/route.ts
components/  Header Intro TabBar ListRow GalleryItem Prose BackLink
lib/content.ts                          the ONLY module that reads content
content/     experience/ gallery/ writing/ settings.yaml
public/images/
keystatic.config.ts
```

Rules:
- Intro + TabBar block is byte-identical across all three tabs and **must not shift** when switching.
- Everything statically generated; `generateStaticParams` on both detail routes.
- Server components unless interactivity demands otherwise.
- Drafts hidden when `VERCEL_ENV === 'production'`, visible on previews.

---

## Content model (Keystatic collections)

**experience** — `title` (slug), `label`, `order`, `hasPage`, `externalUrl?`, `summary`, `cover?`, `body` (markdoc)
**gallery** — `caption` (slug), `projectName`, `image?`, `alt`, `date` → `content/gallery/*.yaml`
**writing** — `title` (slug), `lang` (`en`|`zh`), `label`, `publishedAt`, `draft`, `body` (markdoc)
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

- Measure the live DOM at 1280px against the numbers in the Layout section above — the column lands at x=390, nav top 517, row tops 563/609/655/…, dividers at 608 (inset) / 654 (full) / …
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
