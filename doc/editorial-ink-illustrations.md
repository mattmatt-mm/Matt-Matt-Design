# Editorial ink illustration system

Hand-drawn editorial pen and ink with bold silhouettes, fine expressive contours, and a little visual wit. Build each image around an action you can recognize at a glance. Use flat black over a single light ground for covers. The subject, gesture, and background hue give each article its own identity.

## Visual references

| Reference | What to study |
| --- | --- |
| [Brush and illustrated panel](illustration-references/editorial-ink-scene.png) | The figure's long diagonal gesture, broad black masses in the hair and trousers, open sleeves and face, and a loose brush trail that leads the eye through the composition. |
| [Character lineup](illustration-references/editorial-ink-characters.png) | The way a reader, writer, or presenter is identifiable from their posture and prop. Observe the broad hair shapes, few facial marks, delicate hands, and differences in silhouette. |

Use the first image for scene composition and the second for character construction. Treat both files as visual reference material. The second image includes a document interface around the artwork. Use only the illustrated figures in that screenshot. Draw original figures, gestures, and props for each brief.

## Drawing rules

| Element | Direction |
| --- | --- |
| Contour | Use a pressure-sensitive pen line with a fine entry, a heavier turning curve, and a lifted taper. Keep the slight variation within each continuous stroke. Use finer strokes for fingers, faces, and folds. |
| Black shape | Anchor the scene with two or three solid silhouettes, such as hair, a sleeve, or a prop. Separate adjacent black shapes with a gap when their edges carry the action. |
| Open space | Let the ground show through faces, hands, clothing, and paper. Keep large areas of the composition open so the gesture remains clear. |
| Characters | Use simplified anatomy, expressive profiles, slightly elongated limbs, and readable hands. Change hair, body shape, posture, and clothing across the series. A small eye mark, nose contour, and mouth are usually enough. |
| Props and motion | Pair one active gesture with one main prop. Give it enough scale to read at thumbnail size. Use a short accent or a single sweeping line when it explains motion or directs the eye. |
| Finish | Use a flat ground and crisp ink edges. Skip gray shading, gradients, paper grain, drop shadows, dense hatching, and mechanically uniform outlines. Keep article names, labels, watermarks, and logos out of the artwork. |

## Background palette

Aim for neutral black ink near `#111111`. Use one opaque pastel field per cover, including the open interiors of the drawing. Use the same pastel in light and dark site themes. Assign a different swatch from the neighboring covers when the brief leaves color open.

| Swatch | Target |
| --- | --- |
| Cream | `#F1EDE0` |
| Lavender | `#E8E1F3` |
| Mist blue | `#DEEAF5` |
| Pale mint | `#E1EEE3` |
| Peach | `#F5E3D9` |
| Blush | `#F3E1E7` |

## Compose for the placement

| Placement | Composition and delivery |
| --- | --- |
| Writing cover | Landscape, **1200 × 630 px**. Center the action optically and keep critical details inside the central 75% of the width and height. Compose for a center crop if the tool returns a taller canvas. Use an opaque sRGB PNG in `public/images/writing/<slug>.png`. Keystatic's Writing **Cover image** field maps to `cover: '/images/writing/<slug>.png'` for the Writing index and article link previews. |
| Character spot | Start with a square or portrait frame according to the placement. Show a single action and give the whole silhouette room. Match eye, hand, and line scale across a set. |
| In-article illustration | Match the existing figure slot. Use a single composition around one article claim. For a transparent, theme-colored figure, generate true alpha, verify open interiors, and follow the site's [figure rendering workflow](illustration-animation-workflow.md). Use site components for diagrams that need exact labels or controls. |

## Agent workflow

1. Resolve the article or section and the intended placement. Read its title and copy. Write its central idea in one sentence, then turn it into a concrete scene with a subject, a verb, and one main object.
2. Pick a palette swatch and frame. Check neighboring covers and the smallest slot where the image appears. For a series, reuse the same ink and composition rules and use an approved cover from that series as an extra style reference.
3. Generate with the intended use, the local visual references if available, and the prompt below. Name what each reference contributes. Keep the shared style paragraph verbatim across a set.
4. Compare the result to the references at full size and at **240 × 126 px** for a Writing cover. If the action gets lost, revise the pose or prop before adding details. If the ink drifts, revise the contour or silhouette that caused it. Change one issue per pass and check the crop again.
5. Save the selected asset in the site's media directory. When attaching it to a known article, set the Cover image field and verify the Writing thumbnail and Open Graph image. Keep the article and destination in the handoff along with the pastel choice, generation method, and final prompt. Write concise alt text when the image appears in a page body. When the image simply decorates a link already named by nearby text, use empty alt text.

## Prompt template

```text
Create an original [placement] for an article about [one-sentence claim].
Show [subject] [one action] with [main prop]. Make [focal gesture] readable immediately.
Use the first reference for composition and ink shapes. Use the illustrated figures
in the second for character construction. Invent an original scene and silhouette.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper,
two or three solid black silhouette shapes, finer facial and hand details, open
interiors, restrained motion marks, and generous negative space.

Use a flat [pastel name and hex] ground and neutral black ink. Set the action
within [frame and safe area]. Use the ground color inside open shapes. Keep the
artwork free of typography, logos, gradients, grain, shadows, and dense hatching.
```

## Review before export

- [ ] The scene expresses a claim or action from the article.
- [ ] The pose and main prop read clearly at 240 px wide. The face, hands, and prop still read in the final crop.
- [ ] The strongest dark shapes anchor the scene. The ink tapers within strokes and small details use a lighter line.
- [ ] The background is a single light pastel, including open shapes. Adjacent covers use distinct swatches where appropriate.
- [ ] The exported image has the intended dimensions. The file loads and the assigned entry resolves the correct image.

## First Writing cover

**How a UX designer thinks** opens with the claim that most design decisions happen before anyone draws a screen. The [lavender cover](../public/images/writing/how-ux-designers-think.png) turns that idea into a designer choosing a route through several possibilities on a sheet of paper.

Built-in image generation prompt

```text
Create an original editorial illustration for the article cover of “How a UX designer thinks.” The article is about choosing what problem to solve before drawing a screen. Draw a curious adult designer leaning into an oversized, gently tilted sheet of paper, using the tip of a slim black pen to trace one of three paths out of a simple junction. Let the selected route finish in one solid dot. Make the eye, reaching arm, pen tip, and route form one readable gesture. Show the figure from the waist up in a loose work shirt, with one hand holding the pen and the other resting on the paper edge.

Use the first supplied image (the person with the brush and tilted panel) for the balance of bold black shapes and open space. Use only the illustrated character strip in the second image for expressive faces and hands. Draw a new character and composition.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper, two or three solid black silhouette shapes, finer facial and hand details, open interiors, restrained motion marks, and generous negative space.

Use a single flat, opaque pale lavender ground (#E8E1F3) and neutral black ink (#111111). Let the lavender show through paper, skin, and all open shapes. Landscape canvas for a 1200 × 630 px landscape cover. Place the complete illustration across the middle 70% of the width and middle 52% of the height, with extra empty space at the top and bottom for a centered crop. The sheet's drawn routes should be the only marks inside it. The artwork is free of lettering, logos, watermarks, gradients, texture, shadows, and hatching.
```

## Prompts for the remaining Writing covers

The built-in ImageGen tool used the brush scene, the character lineup, and the lavender cover in that order. The peach and mist-blue covers each had a second pass to vary the character while preserving the action.

### Rules that stuck

[Pale mint cover](../public/images/writing/rules-that-stuck.png)

```text
Create an original editorial illustration for the website article cover “Rules that stuck.” The essay collects small interaction decisions that make an interface feel considered. For its example of immediate press feedback and a gentler release, draw a close-up of a single hand, emerging from a broad dark rolled sleeve, pressing a large rounded push button with the tip of its index finger. Show the button visibly dipping under the fingertip. Give the object a simple outlined low base and a short spring-back accent near one edge. Compose the sleeve and hand on a diagonal across the canvas with plenty of space around the button. Concentrate black ink in the sleeve, the rim of the button, and the few lines where the hand bends. Keep the hand anatomy clear and use the simplest shape sufficient to read as a press.

Use image 1, the illustrated brush scene, for the balance of bold ink and open space. Use only the illustrated figures in image 2 for character construction and hands. Use image 3, the lavender cover for another article on the same website, for line weight, optical scale, and framing. Create a fresh scene on the specified new color.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper, two or three solid black silhouette shapes, finer facial and hand details, open interiors, restrained motion marks, and generous negative space.

Use one solid, opaque pale mint background (#E1EEE3) and neutral black ink (#111111). Let that same pastel show through all open shapes. Use a centered 1200:630 landscape composition with the complete action in the central 75% of the width and height. Give the artwork generous, even breathing room and enough space to allow a centered crop. Keep the image free of lettering, logos, watermarks, gradients, paper grain, shadows, and hatching.
```

### Twelve principles, one square

[Pastel peach cover](../public/images/writing/twelve-principles-one-square.png)

```text
Create an original editorial illustration for the website article cover “Twelve principles, one square.” The article translates traditional character animation into interface motion using one plain square. Draw a waist-up animator with a short curly silhouette, holding up one gently bending strip of three big drawn animation frames. In the strip, show three successive poses of a single featureless black square: stretched up, square in midair, and slightly squashed at landing. A few short gesture strokes can make the strip feel as if it is springing through the hands. Keep the square and the animator's grip readable at small size. Let the animator occupy the right side, facing back toward the big strip. Use open paper interiors and a few large black shapes, with no sprocket-hole pattern or tiny clutter.

Use image 1, the illustrated brush scene, for the balance of bold ink and open space. Use only the illustrated figures in image 2 for character construction and hands. Use image 3, the lavender cover for another article on the same website, for line weight, optical scale, and framing. Create a fresh scene on the specified new color.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper, two or three solid black silhouette shapes, finer facial and hand details, open interiors, restrained motion marks, and generous negative space.

Use one solid, opaque pastel peach background (#F5E3D9) and neutral black ink (#111111). Let that same pastel show through all open shapes. Use a centered 1200:630 landscape composition with the complete action in the central 75% of the width and height. Give the artwork generous, even breathing room and enough space to allow a centered crop. Keep the image free of lettering, logos, watermarks, gradients, paper grain, shadows, and hatching.
```

ImageGen edit prompt applied to the generated cover

```text
Edit the supplied peach illustration. Change the animator on the right into a different person with a short tightly curled black haircut, a broad cheek and jaw, a small ink moustache, and a plain light crew-neck work shirt. Draw simple eyes and nose in open space, with no glasses. Preserve the hand positions and the animator's gaze toward the strip. Preserve the three-frame strip, the tall, square, and squashed black shapes, the motion marks, and the wide framing. Keep the uniform pastel peach background and the same hand-drawn black contours that swell and taper, solid black hair, fine face and hand marks, and open interiors. Maintain clear margins, with no letters or gray shading.
```

### What a transition is for

[Mist blue cover](../public/images/writing/what-a-transition-is-for.png)

```text
Create an original editorial illustration for the website article cover “What a transition is for.” The essay argues that a page transition helps readers keep their bearings by moving the content while the frame stays put. Draw one full-body reader in profile beside a large upright rectangular frame. The reader rests one palm against the stationary upright and looks as one loose page slides horizontally into the opening from the right. Two short horizontal strokes behind the page make the direction readable. Draw the page as a simple slightly tipped rectangle with two small abstract content rules. Use a long black coat or trousers to anchor the reader, and keep the frame and the page mostly open. Aim for a light, legible visual metaphor with clearly distinct edges where the page overlaps the frame.

Use image 1, the illustrated brush scene, for the balance of bold ink and open space. Use only the illustrated figures in image 2 for character construction and hands. Use image 3, the lavender cover for another article on the same website, for line weight, optical scale, and framing. Create a fresh scene on the specified new color.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper, two or three solid black silhouette shapes, finer facial and hand details, open interiors, restrained motion marks, and generous negative space.

Use one solid, opaque mist blue background (#DEEAF5) and neutral black ink (#111111). Let that same pastel show through all open shapes. Use a centered 1200:630 landscape composition with the complete action in the central 75% of the width and height. Give the artwork generous, even breathing room and enough space to allow a centered crop. Keep the image free of lettering, logos, watermarks, gradients, paper grain, shadows, and hatching.
```

ImageGen edit prompt applied to the generated cover

```text
Edit the supplied mist-blue illustration. Change the reader on the left into a different, older person with hair gathered into a small neat ink-black bun, a longer nose in profile, a lightly drawn collarless jacket, and no glasses. Keep the existing full-body stance, the palm touching the upright, and the reader's attention on the moving page. Preserve the stationary black frame, single angled page with two short content rules, horizontal motion marks, the equal breathing room at the outer edges, and the opaque mist-blue field. Draw fine facial and hand marks, bold ink shapes, and pressure-tapered black contours. Preserve the 1200:630 wide aspect and leave the surface free of text, soft shadows, and hatching.
```

### Follow nature

[Cream cover](../public/images/writing/follow-nature.png)

```text
Create an original editorial illustration for the Writing cover “Follow nature.” The essay is about becoming a reference over time by helping a good idea grow in its own direction. Show one gardener with a short black haircut in profile, looking closely at the curved branch of a young tree. The gardener gently guides the branch with an open hand, following the direction it already bends. Make the curve and the point where the hand meets it legible at thumbnail size. Keep the tree to one clear fork and a few bold leaves. Show the gardener from the waist up in simple dark work clothes and set the complete scene within broad empty margins.

Use the illustrated brush scene in image 1 for the balance of bold ink and open space. Use only the character drawings in image 2 for the construction of the eyes and hands. Use the lavender cover in image 3 for optical scale, line weight, and landscape framing. Invent a new character and pose.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper, two or three solid black silhouette shapes, finer facial and hand details, open interiors, restrained motion marks, and generous negative space.

Use one opaque, perfectly flat cream background (#F1EDE0) and neutral black ink (#111111). Let the cream show through the open shapes. Compose for a 1200 × 630 landscape center crop with the full scene inside the central 75% of width and 65% of height. Use clear contours and simplified leaves. Keep the image free of lettering, logos, watermarks, gradients, grain, shadows, and hatching.
```

ImageGen edit prompt applied to the generated cover

```text
Edit the gardener in this cream editorial illustration into a distinct character. Give the gardener closely cropped black hair, no glasses, a longer nose in profile, and a small simple eye mark. Keep the leaning pose, open palm gently supporting the branch, dark short sleeves and apron, the tree and its leaves, scale, central framing, and pressure-sensitive black ink. Keep the background uniformly opaque cream (#F1EDE0), including the open spaces inside the drawing. Maintain the 1200:630 cover proportions and the clear, text-free silhouette.
```

## Hermes Task case study spots

The Problem section uses three 960 × 600 transparent WebP masks. The built-in
ImageGen tool used the brush illustration, character lineup, and lavender
Writing cover as references in that order. The page tints each mask with the
foreground colour in light and dark themes. The panels use the same framing
and ink scale.

| Point | Asset |
| --- | --- |
| People pile up | [Contact cards](../public/figures/hermes/people-editorial.webp) |
| Promises slip | [Slipping reminder](../public/figures/hermes/promises-editorial.webp) |
| Clear action > dashboard | [Phone message](../public/figures/hermes/apps-editorial.webp) |

### ImageGen prompts

Each prompt pairs its scene brief with the shared style and framing.

**People pile up**

```text
Create an original in-article spot for “People pile up.” After a conference, more contacts arrive than one person can keep track of. Show a close-up of two expressive hands from opposite bottom corners trying to hold a fan of three oversized business cards, with a fourth card just slipping upward out of the fan. Give the cards sparse, varied marks: one or two contain a small profile silhouette and a single abstract stroke. Make the thumb bracing the stack and the loose card instantly readable. Use two solid black sleeve cuffs to anchor the drawing. Keep fingers and card corners clearly separated.
```

**Promises slip**

```text
Create an original in-article spot for “Promises slip.” A follow-up can be forgotten the moment a meeting ends. Show an expressive handshake across the upper half, with two angled sleeves entering from opposite sides, and one small square reminder note slipping downward out of the handshake. Put an empty hand-drawn checkbox on the note and one curved motion mark beside it. Keep the note visually separate from the hands as the only falling object. Use bold shapes in the sleeves and delicate, readable linework in the fingers. Give the handshake and falling note comparable visual weight.
```

**Apps wait to be opened**

```text
Create an original in-article spot for “Apps wait to be opened.” After a day of meetings, one message is easier than opening another app. Show one tired worker in simple side profile choosing to lift a small phone beside a closed laptop. A single oversized hand-drawn speech bubble with one tapered wobble in its contour and two tiny abstract ink strokes floats above the phone. The person and the speech bubble form one clear gesture. Use a bold black hair silhouette and one broad black sleeve shape, a few light facial marks, and keep the closed laptop low and unobtrusive. Give the message bubble the clearest outline in the composition.
```

**Shared style and framing**

```text
Use the brush illustration in image 1 for the balance of solid ink and open space. Use only the illustrated figures in image 2 for expressive anatomy. Use the lavender Writing cover in image 3 for pen weight and simplification. Draw a new composition with these stylistic qualities.

Editorial pen-and-ink drawing with pressure-sensitive contours that swell and taper, two or three solid black silhouette shapes, finer facial and hand details, open interiors, restrained motion marks, and generous negative space.

Draw with solid neutral black ink on genuine transparent alpha. The skin, paper, and other open shapes also have transparent interiors. Make one isolated landscape in-article spot for an 8:5 slot about 200 pixels wide, with the action centered and all marks inside roomy clear margins. Give the main gesture a bold, readable silhouette at thumbnail size. Use only ink and transparency. Keep the image free of lettering, logos, frames, shadows, gradients, grain, and dense hatching.
```

**Phone message lettering**

```text
Edit this transparent editorial illustration of a person sending a message. Add this exact handwritten text inside the speech bubble: “Meet John tmr”. Use two optically centered lines, “Meet John” above “tmr”, without the quotation marks or punctuation. Draw it in a relaxed, legible hand with simple letterforms and subtly tapered, medium-weight black pen strokes. The lettering should take up most of the space inside the oval while leaving a comfortable margin, so it still reads when the whole illustration is about 200 px wide. Preserve the person, phone, laptop, bubble outline, orientation, all existing ink strokes, and the 8:5 framing. Use the same black ink and genuine transparent alpha, including inside the bubble and between the letters.
```
