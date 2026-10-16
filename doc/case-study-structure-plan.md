# Case-study voice and structure

Requested by Matt on 2026-10-17: study how a reference portfolio
(rachelchen.tech/projects/openai) phrases a project from problem to thinking,
and how it lays out and draws the problem, then apply that to every case study,
write up HKUST ISD, and add a post on how UX designers think.

We borrow the reference's **structure and phrasing technique**, not its words
or look. Everything stays in the site's 16/21 type, tokens and hairlines.

## What the reference does

**Phrasing**

- Every section heading is a claim, not a label. Instead of "Problem" it says
  what the problem *is*, as a full sentence. A reader skimming only the
  headings gets the whole argument.
- A short muted eyebrow names the kind of section (Overview, Problem,
  Opportunity, Constraint, Reflection) above the claim.
- The overview opens on a question the project had to answer, then the team
  and the constraint (people, weeks).
- Thinking is shown as a chain: problem → opportunity → solution → insight →
  decision. Each decision points back to the insight that caused it.
- Pivots are questions: "So we had to ask: how do we …?"
- Trade-offs are named out loud: what was given up, for what, and why that was
  acceptable.
- Lists come in threes, each item a two-to-four-word title plus one sentence.
- Plain words, short sentences, "we" for team work, no adjectives doing the
  work evidence should do.
- It ends with what was learned, as two or three short imperative lessons.

**Layout and graphics**

- A metadata row under the title: collaborators, timeline, scope.
- Process, benefits, insights and principles as rows of equal columns: title
  in the foreground colour, one line of explanation beneath.
- The problem is drawn, not only described (a stack diagram, a comparison of
  options with their considerations).
- Big imagery per section; text stays narrow.

## How it maps onto this site

| Reference | Here |
|---|---|
| Metadata row | Start / End / Role / Team figures under the title (`start`, `end`, `role`, `team` fields) |
| Eyebrow + claim heading | `#### Problem` directly above `## <claim>`; h4 is already muted 16/21. The pair sits 4px apart. The section rail shows the eyebrow, so the rail stays short |
| Title + one-liner columns | New **Points** block: `{% points %}{% point title="…" text="…" /%}…{% /points %}` |
| Drawn problem | New **Flows** block: two step lists side by side meeting in one shared outcome, drawn with the list rows' hairlines. Used for Incipe's six steps versus two |
| Pivot question | A blockquote (muted, left hairline) |
| Outcomes | The existing Stats block |

## Section skeleton

1. Thumbnail (before the first heading).
2. **Overview** — the question the project answered; who, how long.
3. **Problem** — the claim; two or three short paragraphs of evidence.
4. **Approach / Opportunity** — Points.
5. One section per design decision — claim heading, what was tried, what was
   chosen and why, imagery.
6. **Trade-off** where there was one, named plainly.
7. **Outcome** — Stats, when there are numbers.
8. **Reflection** — two or three lessons as Points.

Facts come only from Matt's notes, CV and existing copy. Where the pattern asks
for something we do not have (a number, a test result), the section is left
out rather than filled in.
