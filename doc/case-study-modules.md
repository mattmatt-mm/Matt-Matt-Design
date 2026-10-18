# Case-study modules

Every case study is a stack of modules. Each one has a fixed name so Matt can
ask for one by name, e.g. "add a **Stat row** after Solution", "turn this list
into a **Point row**", "give the agent clip a **Framed recording** with the
caption *Agent as guide*".

Requested by Matt on 2026-10-18. Keep this file current whenever a module is
added, renamed or retired.

## At a glance

| Name | What it is | Example |
|---|---|---|
| **Thumbnail** | The opening image, video or animation, wider than the text | Hermes Task's cobalt image |
| **Project figures** | Timeline, Role and Team under the title | Every case study with dates |
| **Link line** | One link to the live product, at the top | "Open Hermes Task" |
| **Section heading** | Muted eyebrow above a claim heading | "Problem" / "One sensor took six steps…" |
| **Body text** | Plain paragraphs | Everywhere |
| **Bullet list** | A short list, optionally bold lead-ins | Hermes Task, Speed |
| **Pull question** | A question set off with a hairline on its left | Melo Portal, Approach |
| **Stat row** | Big figures with a muted label beneath | Incipe's US$48K, 80K, Top Performer |
| **Point row** | Two to three titles, each with one line under it | Hermes Task, Agent ("Short IDs…") |
| **Drawn point row** | A Point row with a small line drawing above each point | Hermes Task, Problem ("People pile up…") |
| **Step comparison** | Two step lists side by side, meeting in one outcome | Incipe's six steps against two |
| **Notes** | An Apple Notes card holding an interaction's exact numbers, with a Copy prompt button | Incipe's "Panel recipe" |
| **Framed recording** | A full-width screen recording filed under a short caption tab | Every recording in Incipe and Hermes |
| **Bare recording** | The player alone, no frame or caption | — (any video without a caption) |
| **Image** | A still at text width; zooms on click | Neardeal's leaf logo |
| **ISD dot hero** | The animated ISD dot story, ending on the ISD logo | HKUST AIS opening |
| **Lottie sequence** | Lottie clips played in order, looped | Kedonia's opening |

## The modules

### Thumbnail
Whatever sits before the first section heading opens the page at up to 840px
wide. An image there is also what a home card morphs into
(`doc/thumbnail-morph-plan.md`), so use the same picture as the home card.
A video or Lottie sequence can be the thumbnail too, but then nothing morphs.

### Project figures
Not written in the body: they come from the entry's `start`, `end`, `role`
and `team` fields and print under the title. Empty ones are left out.

### Link line
A single Markdown link above the thumbnail: `[Open Hermes Task](https://…)`.

### Section heading
A muted eyebrow naming the kind of section, then a heading that states what
the section concludes (see `doc/case-study-structure-plan.md`). The eyebrow is
what appears in the section rail on the left.

```
#### Problem

## One sensor took six steps before you could build anything.
```

### Stat row
Figure in the text colour, label muted beneath, 16/21 only. Stacks below
640px.

```
{% stats %}
{% stat value="US$48K" label="revenue in the first three months" /%}
{% stat value="80K" label="social media views in three months" /%}
{% /stats %}
```

### Point row
Two or three points, each a two-to-four-word title and one sentence.

```
{% points %}
{% point title="Short IDs" text="Every record gets an ID like T-20…" /%}
{% point title="Three verbs" text="Hermes can apply changes…" /%}
{% /points %}
```

### Drawn point row
A Point row whose points each carry `figure`, a line drawing in the site's own
colours (`components/PointFigure.tsx`). Drawings available now: `crowd`,
`promises`, `message`. A new drawing is made to order: describe the idea and
it is drawn in the same style.

```
{% point figure="crowd" title="People pile up" text="…" /%}
```

### Step comparison
Two step lists that end in one shared outcome, drawn with the list rows'
hairlines. Steps are separated by `|`.

```
{% flows outcome="Integrate, deploy & test" note="Application logic is needed either way." %}
{% flow title="Traditional setup" steps="Read datasheets | Wire the sensor | …" /%}
{% flow title="Incipe" steps="Snap in the sensor | Read it with one line of code" /%}
{% /flows %}
```

### Notes
An Apple Notes card: a yellow band with the title and a **Copy prompt**
button, a perforated tear line, and ruled paper with each line of text on a
rule (`components/Notes.tsx`). Added 2026-10-18.

It holds the recipe behind an interaction (durations, distances, sizes,
curves, sounds) so the prose around it can describe what the interaction
feels like instead (`doc/case-study-voice.md`). Write it as an instruction a
reader could paste into their own AI tool: an opening line saying what to
build, then one behaviour per bullet. Copy prompt copies it as Markdown.
Title it "<Thing> recipe", e.g. "Panel recipe"; place it after the section's
prose and recording.

```
{% notes title="Press recipe" %}
Give every pressable element one shared press state:

- On press: scale to 98% over 0.2s and dim slightly.
- Menus enter instantly and exit with a 90ms opacity fade.
{% /notes %}
```

### Framed recording
A screen recording filed like a folder: a very short caption (two to four
words, e.g. "Live board preview") on a grey tab at its top-left, an inside
curve where the tab meets the recording, and the recording itself at full
width beneath (`components/Recording.tsx`). Added 2026-10-18; on the same day
Matt replaced the first version, a padded backdrop frame, because the padding
made the video too small.

- The tab is the page's line grey with the text colour on it, so the caption
  is legible in light and dark without any measuring.
- `title` is the longer description for screen readers; it is not shown.

```
{% video src="/videos/experience/incipe-workspace/agent.mp4"
  poster="/videos/experience/incipe-workspace/agent-poster.webp"
  caption="The agent as a guide"
  title="Chatting with the Incipe agent: …" /%}
```

Recordings go in `public/videos/experience/<slug>/`, re-encoded to H.264
without sound, with a first-frame poster.

### Bare recording
The same tag without `caption`: just the player.

### Image
A Markdown image. It sits at text width inside a section and zooms on click.
Alt text in the brackets describes it for screen readers.

```
![The Neardeal mark, a white leaf on green…](/images/experience/neardeal/image.webp)
```

### ISD dot hero
The HKUST AIS opening: one dot divides into a matrix that becomes a world
map, two ripples collide, the team circles and sprints, and a ripple turns
everything into the ISD logo before the camera dives into its empty
triangle and the loop begins again (`components/isd/`, story and decisions
in `doc/isd-dot-hero-plan.md`). It is a canvas, not a video: sharp at any
size, about 11 KB of data, playing only while on screen and resting on the
logo under reduced motion. Orange on cream in both themes.

```
{% isd-hero /%}
```

Placed above the first section it is the case study's thumbnail. Its timing
is tuned on the unlinked review page at `/lab/isd-hero`.

### Lottie sequence
Lottie exports played in order and looped; files in `public/lottie/`.

```
{% lottie title="…" %}{% clip src="/lottie/a.json" /%}{% clip src="/lottie/b.json" /%}{% /lottie %}
```

### Pull question, Bullet list, Body text
Plain Markdown: `> question` for a Pull question, `-` lines for a Bullet list.

## Writing posts only

**Demo** — an interactive example (`{% demo kind="easing" /%}`), used in
writing posts rather than case studies.
