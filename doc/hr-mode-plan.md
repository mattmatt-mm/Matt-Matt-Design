# HR mode: guided tour and engagement tracking

- Status: built 2026-10-18
- Owner: Matt

## What it does

A recruiter landing on the site for the first time is greeted by Matt's AI,
which offers a guided tour. If they accept, they pick the kinds of work they
care about and are handed a walkthrough made of only those case studies.
Everything they open and click from then on is recorded, anonymously, so Matt
can see which work actually gets read.

## Flow

0. **Cookies.** About a second after the first page settles, the AI opens on
   its own and asks first: "Hi, I'm Matt's AI. Can Matt use cookies to see how
   visitors use his site?", with a muted line on what he sees and why.
   **Decline** / **Accept**. Asked until answered, then never again (Matt,
   2026-10-18). Either answer moves straight on to the offer, if one is due.
1. **Offer.** "Want a guided walkthrough of Matt’s case studies?" Choose
   **No thanks** or **Walk me through**.
   Nothing is focused on arrival, so no focus ring shows until someone tabs.
2. **Pick.** "Which kinds of work would you like to see?" with a three-row checklist — Branding, UI/UX,
   Frontend development. Any number can be selected; **Continue** waits for at
   least one.
3. **Ready.** "Your guided walkthrough is ready." Press **Start walkthrough**.
4. **Walkthrough.** `/tour/<focus>` — the case-study chain (the same scroll-on
   reading as `/work/*`) holding only the case studies tagged with a chosen
   discipline, in list order. A muted line over the first title says what the
   walkthrough covers.
   Pressing Start walkthrough plays the splash below on the way in.
5. **Settle.** Once the splash has gone, the cloud speaks through the same
   answer surface the AI uses, centred 8px above the dock: "Please enjoy." (2.4s), then "You can change what's
   shown by pressing me." (6s), then it goes quiet. Pressing the cloud (or the
   bubble) on a walkthrough opens the checklist with the current picks ticked,
   over any conversation already had, plus **Ask a question** to return to it.
   Picking again replays the splash, even onto the same walkthrough.
6. **Exit.** The dock is contracted, exactly as on a case study, but the circle
   holds an **X** instead of the back arrow. It leaves the walkthrough for Home.

**Guided walkthrough** sits above the first-question composer, on the left — and above the follow-up composer once a conversation exists, between the answer and the field — so the
walkthrough can be found again at any time. Someone who has already said yes
goes straight to the checklist. The composer's review notice moved into an info
button on the right of the same row, shown as a tooltip on hover, focus or tap.

The offer appears at most once every 24 hours per browser (Matt's choice,
2026-10-18). `mmd:tour-offered` in localStorage holds when it last appeared, and
it is stamped the moment the offer shows — so leaving the page without
answering counts too. Adding `?tour` to any URL shows it regardless — useful for
testing and for links Matt sends out.

`<focus>` is the chosen disciplines in a fixed order joined by `-`
(`branding-uiux`, `uiux-frontend`, …). All seven combinations are prerendered.
Tour pages are `noindex` and stay out of the sitemap — they repeat case-study
content that already has a canonical home.

## Walkthrough splash

`components/ai/WalkthroughSplash.tsx` uses the official `distortion-waves`
package for the opening, then hands off to the original title animation.

- The colourful vertical wave starts from the button and bends a snapshot of
  the page into the splash. The button swells, blurs and fades above it.
- The eyebrow and selected titles rise 12px out of a 3px blur, 90ms apart.
- Once the wave covers the page, the walkthrough loads underneath. The sheet
  wipes upward while the eyebrow and first title glide onto the real heading.

- The sheet is `--color-bg`, so it follows the system theme rather than
  flashing white in dark mode.
- A tap, click or Escape skips straight to the reveal.
- It plays on every Start walkthrough. Opening a `/tour` link directly shows the
  page with no splash — there is no button press to carry it.
- Reduced motion: no splash; the walkthrough simply opens.

## Content

Experience entries gain a **Disciplines** multiselect in Keystatic (Branding,
UI/UX, Frontend development). It decides which checklist rows a case study answers to
and is never shown on the page. Starting values, read from each entry's role
and summary — Matt should check them:

| Case study | Branding | UI/UX | Frontend |
|---|---|---|---|
| Incipe Workspace | | ✓ | ✓ |
| Hermes Task | | ✓ | ✓ |
| HKUST AIS | ✓ | | |
| Bowtie & JP Health | | ✓ | |
| Kedonia | ✓ | ✓ | |
| Neardeal | ✓ | ✓ | ✓ |
| Project Melo | | ✓ | |

## Tracking

PostHog, loaded only after **Accept** on the AI's cookie question — the tour
no longer has anything to do with consent. The answer is remembered
(`mmd:tracking` = `granted` or `denied`), so it is asked once and a returning
visitor who accepted keeps being recorded. Anyone who declines, or has not
answered, sends nothing at all.

Once granted:

- Page views and page leaves (with scroll depth), including client navigations.
- Autocapture of every click, plus heatmaps.
- Session replays, with every input masked so contact-form text never leaves the
  browser.
- Named events:
  - `cookies_accepted`
  - `tour_offered`, `tour_accepted`, `tour_declined`, `tour_reopened`
    ("Guided walkthrough"), `tour_disciplines_selected`, `tour_started`,
    `tour_configure_opened` (the cloud on a walkthrough), `tour_exited`
  - `walkthrough_message_shown` — each of the cloud's lines (`line`, `step`)
  - `case_study_viewed` / `post_viewed` each time the chain reaches a new entry
    (`slug`, and `source`: `tour` or `site`)
  - `ai_question_asked` — the question's text and turn; the composer already
    says questions may be reviewed
  - `contact_sent` — that the email form was sent, never its contents
- `?ref=<anything>` on any URL is stored with the visitor, so a link sent to a
  company (`mattmattdesign.com/?ref=acme&tour`) shows up under that name.

Requests go through `/ingest` on Matt's own domain (a Next.js rewrite) so ad
blockers do not drop them.

### Setup (Matt)

1. Create a free PostHog Cloud project (US or EU).
2. In Vercel → Settings → Environment Variables add
   `NEXT_PUBLIC_POSTHOG_KEY` (the project API key, starts `phc_`) and, for an EU
   project, `NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.
3. Redeploy. Without the key the tour still works and nothing is sent.
4. In PostHog: Activity shows each visitor's clicks in order, Replays shows the
   sessions, Toolbar → Heatmap draws clicks over the live site.

## Interface notes

- Every surface comes from the existing AI vocabulary: the black response
  surface, and squircle buttons beneath it with the 8px companion gap.
- The pick step is a checklist on the email form's surface, one row per skill.
- The primary button is the black `Send to Matt` treatment; No thanks is the
  same shape on the theme surface.
- Steps change with the existing `ai-content-enter` rise and blur.
