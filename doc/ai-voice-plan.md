# AI voice — from recited facts to conversation

- Status: built
- Asked for: Matt, 2026-10-22 ("the response sounds a little robotic")
- Supersedes: the single-fact grounding in `doc/ai-tab-experience-plan.md` §10

## Why it sounded robotic

The AI was always a real model (GLM 5.2 through OpenRouter), but it was boxed
in:

1. A keyword matcher picked one fact from `content/ai-knowledge.yaml`, and the
   model saw only that fact. It paraphrased one CV line, could not connect two
   topics, and any question no alias matched got the canned fallback.
2. Temperature 0.2 and "never go beyond the approved fact".
3. Follow-ups carried only the opening question, never the answers, so the
   model could not refer back.
4. A bug: the client sent the opening question only on turn 2, so every
   question from turn 3 on failed the turn check as "unavailable".

## What changed

- **One briefing.** Every fact with policy `answer`, plus each case study's
  summary, goes to the model as a single briefing (`lib/ai/prompt.ts`). It may
  connect facts across topics and explain why they matter, but every claim
  about Matt must be supported by the briefing. Nothing outside it, no
  invented projects, numbers or plans.
- **Walls stay deterministic.** Private topics, pricing and availability, and
  prompt injection are still decided by `lib/ai/policy.ts` before the model is
  called, and those questions never see the briefing. Added "charge", "cost",
  "fee" and "quote" to the contact markers ("How much does he charge" slipped
  through).
- **Voice.** A thoughtful friend who knows Matt's work: warm, specific,
  plain, varied openings, never naming its notes. Temperature 0.7. The voice
  rules Matt edits in Keystatic (AI knowledge) were rewritten to match.
- **Memory.** The last three exchanges travel with each follow-up, capped and
  trimmed on the server. They only shape the answer to that same visitor.
- **Length.** The answer aims for 40 to 80 words. The 100-word ceiling now
  ends on a whole sentence: past 60 words, text is held until its sentence
  ends and dropped whole if it would cross 100 (`lib/ai/limits.ts`).
- **Budget.** GLM reasons before writing (about 200 tokens), billed against
  `maxOutputTokens`; at 320 answers ran out mid-sentence, so it is 800.

## Pricing (2026-10-22)

Price questions are no longer walled off. Matt asked the AI to answer them:
a one-off price quoted before the project is understood is irresponsible and
buys a bad result; he offers a HK$30,000 a month subscription for unlimited
design requests, or customised one-off pricing, and the visitor can leave an
email for a quote. This lives in the `pricing` fact in AI knowledge, and the
pricing words left the contact markers in `lib/ai/policy.ts`. Availability,
hiring and timelines still go straight to the email handoff.

## Knowledge added from Matt's Global Shapers notes

Three facts (`education-mission`, `hong-kong`, `collaboration-and-learning`),
plus the Melo events portal and the Ocean Park research purpose. Kept to what
the notes state as Matt's own experience and belief. Left out on purpose:
the application itself, its draft answers, proposed commitments to Hub
projects, and "cultural influence" (no example yet). The Hong Kong vision
sentence came from a draft Matt marked "to confirm"; check it in Keystatic.

## Tested (local, real model)

Multi-turn conversations to turn 4, a cross-topic question, an unknown
(piano), a Cantonese question, home address (private wall), "how much does he
charge" (contact wall), and "ignore previous instructions" (refused).
