# SEO and AI search

- Status: Part 2 built 2026-10-19 (not yet deployed); Part 1 is Matt's to do
- Owner: Matt

## What it is for

Two kinds of visitor should be able to find Matt without already knowing the
address:

1. **Someone searching Google** — a recruiter typing "design engineer Hong
   Kong", a client typing "HKUST ISD brand design", someone typing Matt's name.
2. **Someone asking an AI** — ChatGPT, Perplexity, Claude, Gemini or Google's AI
   Overviews answering "who designed the HKUST ISD brand?" or "find me a design
   engineer who also builds". These read the same pages Google reads, then quote
   whatever states facts most plainly.

Both care about the same three things: can they **reach** the page, do they
**understand who and what it is about**, and is there a **plain sentence worth
quoting**. This plan works through that funnel in order.

## Where the site stands today

Already right, nothing to do:

- Every page is built ahead of time as plain HTML, so crawlers read the full
  text without running any script.
- `sitemap.xml` lists every case study and post; `robots.txt` allows everything
  except the CMS and the API.
- Each page names its own canonical address, so `www`, preview deployments and
  the tour pages never compete with the real page.
- The walkthrough (`/tour/*`) and the lab page are hidden from search, which is
  correct — their content already lives under `/work`.
- Case studies open with a question and a plain answer in their `summary`. This
  is exactly the shape AI answers quote. Keep writing them this way.
- Images carry real alt text, and there is an RSS feed.

The gaps, most damaging first:

| # | Gap | Why it matters |
|---|---|---|
| 1 | The site only ever says **"Matt"**, with nothing else to pin it down | A first name alone cannot be told apart from every other Matt. Matt's full name stays off the site (decided 2026-10-19), so the site has to be identified another way: one consistent brand name, the city, the specialities and the profiles that link to it (see 2.1). |
| 2 | **No structured data** | Search engines and AIs are never told in their own format that this is a person, what his job is, which profiles are his, and that each case study is his work. |
| 3 | **Writing posts have no description** | Google invents a snippet from the first lines; shares show the generic site description instead of what the post is about. |
| 4 | Home page title is generic | "Matt — Design Engineer" says nothing about place or speciality, which is what people actually search. |
| 5 | Sitemap gives no dates for case studies | Google cannot tell which pages changed, so it re-reads them less often. |
| 6 | Nothing written for AI readers | No `llms.txt`, and nothing confirms the AI crawlers are let in by Vercel's bot protection. |
| 7 | Bing is not set up | ChatGPT's search and Copilot both draw on Bing's index. If Bing has not indexed the site, ChatGPT is much less likely to find it. |

## Part 1 — Things Matt does (no code)

These need Matt's accounts, so only he can do them. Most take minutes.

### Google Search Console

1. Make sure the property is a **Domain** property (`mattmattdesign.com`), not
   only a URL-prefix one, so `www` and every page are covered.
2. **Sitemaps** → submit `https://mattmattdesign.com/sitemap.xml` (re-submit
   after Part 2 ships).
3. **URL Inspection** → paste each case study address → **Request indexing**.
   Do this once now and again whenever a case study is published or rewritten.
4. **Pages** report → anything listed under "Crawled – currently not indexed" or
   "Discovered – currently not indexed" is a page Google saw but did not keep.
   Send that list to Claude to look at.
5. **Performance** → every month, note which searches bring impressions. Those
   words are what the next case study's summary and headings should use.
6. **Enhancements** → after Part 2 ships, structured data reports appear here.
   They should show zero errors.

### Bing Webmaster Tools (the most important new step for AI search)

1. Sign in at bing.com/webmasters and choose **Import from Google Search
   Console** — it copies the site and sitemap across in one step.
2. This is what feeds ChatGPT search and Microsoft Copilot.

### Vercel

1. In the project's **Firewall** settings, check that bot protection is not
   challenging AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
   PerplexityBot, Google-Extended). A challenged crawler sees an empty page.

### Off the site — the profiles that vouch for it

AIs trust a fact more when several independent places agree on it.

1. Use the **same display name ("Matt · Matt Matt Design") and the same one-line role** on LinkedIn, GitHub and any other
   profile (Read.cv, Dribbble, Behance, X), and link each one back to
   `mattmattdesign.com`. Without a full name, this consistency is what lets
   Google and the AIs know they are all the same person.
2. Ask the people behind the case studies — HKUST ISD, Incipe, Neardeal,
   Kedonia — to link to the matching case study from their own site or credits
   page. One link from `hkust.edu.hk` is worth more than any change in this plan.
3. When a post is shared on LinkedIn or Medium, post a short excerpt that links
   back, rather than the whole post, so the site stays the original.

## Part 2 — Code changes (Claude builds after review)

Nothing here changes how any page looks.

### 2.1 Identity and audiences

On 2026-10-23 Matt asked to be found by **"Matt Tam"**, **"Matt Matt Design"**
and **"Matt Design"**. The full name now goes in metadata only: the home title
("Matt Tam — Matt Matt Design · Design Engineer in Hong Kong"), meta
descriptions, keywords, the Person schema (`name`, `givenName`, `familyName`,
`alternateName`), the WebSite schema's `alternateName`, and `llms.txt`. The
copy a visitor reads still says "Matt". (Until then the full name was kept off
the site entirely, decided 2026-10-19.)

Alongside the names, four things always appear together:

- **Name**: "Matt", with the brand **"Matt Matt Design"** as the name of the
  site (it matches the domain and the LinkedIn/GitHub handle `mattmatt-mm`).
- **Place**: based in Hong Kong.
- **Work**: the case studies, especially HKUST ISD, which already carry
  searchable names.
- **Profiles**: LinkedIn and GitHub, linked both ways.

Honest trade-off: searches for Matt *by name* will be weak. That is acceptable
because the people Matt wants are searching for a **skill in a place**, not a
name. Those searches split by audience:

| Audience | What they search | What the site says to them |
|---|---|---|
| US (remote) | "design engineer", "design engineer portfolio", "designer who codes" | **Design Engineer** |
| Hong Kong | "UI/UX designer Hong Kong", "brand designer Hong Kong", "AI transformation Hong Kong" | **UI/UX, Brand, AI Transformation** |

Both audiences read the same English pages, so one set of words has to serve
both:

- Home title: **"Matt — Design Engineer in Hong Kong · UI/UX, Brand & AI"**
  (Google shows about 60 characters; this fits).
- Every other page's title ends "— Matt Matt Design".
- Default description, one factual sentence: *"Matt is a Hong Kong–based design
  engineer working on UI/UX, brand design and AI transformation — most recently
  the brand system for HKUST's Division of Integrative Systems and Design."*
- Structured data lists both: job title "Design Engineer", `knowsAbout`
  UI/UX design, brand design, AI transformation and frontend development, and
  `areaServed` United States and Hong Kong.
- The Settings role line ("Design Engineer") stays as it is on screen.

**Content gap — AI transformation.** "AI transformation" is a service HK clients
will search for, but no page currently says it in those words. Incipe Workspace
and Hermes Task are exactly that kind of work. Proposal: mention "AI
transformation" plainly in their summaries, or add one short case study or post
framed around helping a team adopt AI. The wording is Matt's call.

### 2.2 Structured data (JSON-LD)

A small invisible block in each page's HTML, read by Google and AIs:

- **Home** — `Person` (name "Matt", job title, Hong Kong, email, `sameAs` →
  LinkedIn and GitHub, `knowsAbout` and `areaServed` as in 2.1) and `WebSite`
  named "Matt Matt Design". No full name and no headshot.
- **Each case study** — `CreativeWork` with title, summary, cover, the
  Timeline / Role / Team figures already on the page, and Matt as author.
- **Each post** — `BlogPosting` with title, description, publish date, language
  (`en` or `zh-Hant`) and Matt as author.
- **Detail pages** — `BreadcrumbList` (Home › Profile › Case study), which
  Google can show in place of the bare address.

All values come from `content/` through `lib/content.ts`, so they update when
Matt edits in Keystatic. CV facts in `content/ai-knowledge.yaml` stay
chat-only and are **not** used here.

### 2.3 Writing descriptions

- Add an optional `summary` field to writing posts in Keystatic.
- Used for the meta description, the share card and the structured data. When
  empty, fall back to the post's first paragraph, cut at a sentence end.

### 2.4 Sitemap dates

- Case studies get a `lastModified` date. Proposed source: the date the file
  last changed in git, so Matt never has to maintain it.
- Drop the `priority` value — Google ignores it.

### 2.5 For AI readers

- **`/llms.txt`** — generated at build time from public content only: who Matt
  is in two sentences, then each case study's title, summary and link, then each
  post's title and link. A short, plain map that AI tools increasingly look for.
- **`robots.txt`** — name the AI crawlers explicitly as allowed, so the intent
  is on record and stays correct if a broader rule is ever added.
- **Profile page** — confirm the page's text states, in plain sentences, what
  the row list implies visually (role, where, what kind of work). If not, the
  intro copy is the place, and that is Matt's call on wording.

### 2.6 Share images for posts

- Posts currently all share the site's default card. Optional `cover` field on
  posts, falling back to the default. Low priority.

## Part 3 — Measuring it

- **Google Search Console** is the main scoreboard: impressions and clicks per
  search, per page. Check monthly.
- **Bing Webmaster Tools** shows the same for Bing, and has started reporting
  AI-assistant citations.
- **PostHog** (for visitors who accept cookies) already records referrers.
  A saved view filtered to `chatgpt.com`, `perplexity.ai`, `claude.ai`,
  `gemini.google.com` and `copilot.microsoft.com` shows AI-sent visitors.
- **A monthly manual check**: ask ChatGPT, Perplexity and Gemini "Who designed
  the HKUST ISD brand?", "Find me a UI/UX designer in Hong Kong" and "Find me a
  design engineer portfolio" and note whether the site is cited.

Expect weeks, not days: Google typically takes 2–8 weeks to reflect changes,
and AI answers lag behind the search indexes they draw on.

## Decisions

- 2026-10-19 — No full name anywhere on the site or in its code. No headshot.
- 2026-10-23 — Superseded for metadata: search should find "Matt Tam", "Matt
  Matt Design" and "Matt Design". Full name in titles, descriptions, keywords,
  JSON-LD and llms.txt; never in visible copy. Still no headshot.
- 2026-10-19 — Based in Hong Kong. US audience: Design Engineer. Hong Kong
  audience: UI/UX, Brand, AI Transformation.
- 2026-10-19 — The site's brand name is "Matt Matt Design".
- 2026-10-19 — Chinese posts get their own Chinese-language description,
  written in the post's `summary` field like any other post.

## Open questions for Matt

1. AI transformation: reword the Incipe Workspace / Hermes Task summaries, or
   write a new page for it later?

## Build order

1. Matt answers the open questions; Matt does Part 1 Bing + Vercel checks.
2. 2.1 identity and titles → 2.2 structured data → 2.3 writing descriptions.
3. 2.4 sitemap → 2.5 AI readers → 2.6 post covers.
4. Verify: Google's Rich Results Test on home, one case study and one post
   shows no errors; `pnpm build` passes; re-submit the sitemap in Search Console.
