# Case-study voice

How case studies talk about interaction. Requested by Matt on 2026-10-18,
after he found lines like "one 24px height, 4px between controls in a group,
8px between groups" too robotic to read.

Studied from two references, for their technique, never their words:

- **Family Values** (Benji Taylor, 2024), on the Family crypto wallet.
- **Rachel Chen, Notion Custom Agents** (rachelchen.tech/projects/notion).

`doc/case-study-structure-plan.md` covers the section structure (eyebrow,
claim heading, Points, Reflection). This file covers the sentences.

## The rule

**Say what it feels like, not what it measures.** The prose describes the
behaviour a person notices and why it is there. The exact numbers still
matter. They go in a **Notes** module beside the section (see
`doc/case-study-modules.md`), written as a prompt someone can paste into
their own AI tool to rebuild the interaction.

| Robotic | Human |
|---|---|
| It dips to 98% over 0.2s and dims slightly. | Press anything and it gives a little under your finger, like a real button. |
| Pull 200px past the minimum width and the panel leans 20px toward its exit and fades to half. | Pull a panel too far and it starts to lean away and fade, as if it is about to go. Ease off and it settles back. |
| A row of controls is one object: one 24px height, 4px between controls in a group, 8px between groups. | A row of controls reads as one object: everything the same height, and the gaps tell you which buttons belong together. |
| Switching pages is a 250ms slide: 8px of travel, a fade and a 3px blur. | Pages slide in the direction you are going, so you always know whether you went forward or back. |

## What the references do

**Start from the person, not the component.** Family opens each idea with
what a person experiences ("static transitions can disrupt the user's sense of
flow") before saying what was built. Rachel opens with what users were left
asking: what has updated, do I have to save, what am I saving.

**Turn a mechanism into a picture.** Family explains trays as walking towards
a room through an open door: you see a little, then more as you step in. Tab
switches "fly instead of teleport". One familiar image does the work of a
paragraph of numbers.

**Say why it exists in the same breath.** Every behaviour comes with its
reason: each tray is a different height *so the change is unmistakable*; the
amount moves between screens *so you trust it is the amount being sent*.

**Name the principle, then show it.** Family names three values (simplicity,
fluidity, delight) and every example is filed under one. Rachel names two
decisions and shows each. A reader skimming the bold lines gets the argument.

**Decisions as "instead of".** Rachel: "Instead of a persistent save button
that users become blind to, I decided…" The rejected option makes the chosen
one meaningful.

**Show the absence.** Family removes its own animation to show what is lost:
"the sense of connection is lost". Saying what it would feel like *without*
the detail is often the clearest way to say why it matters.

**Short, warm, a little personal.** Plain words, short sentences, the odd
aside ("a pet peeve of mine…"). First person for decisions, "you" for the
reader using the product.

## Keeping numbers

- **Outcomes stay in the prose** as a Stat row: revenue, conversion, requests
  saved. Those are the result, not the recipe.
- **Recipes go in Notes**: durations, distances, sizes, curves, frequencies.
  Write them as an instruction ("Build side panels that…"), one behaviour per
  line, so the whole note can be copied and pasted as a prompt.
- A number may stay in prose only when the number itself is the surprise
  ("1,692 database requests in one hour").
