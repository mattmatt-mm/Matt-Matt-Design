# Matt Matt Design component library

Status: first release implemented on 2026-11-26

## Goal

Give developers one place to discover the modules used across the portfolio,
try each interaction, and take what they need into their own project. The public
name would be **Components**. Start with Notes, Dynamic dock, Flipbook, and Pull
card transition, then add the rest of the inventory below.

## How developers use it

| Action | What the visitor gets |
| --- | --- |
| **Preview** | A working example they can tap, drag, scroll, or control with the keyboard. |
| **Copy prompt** | An editable Markdown recipe for a coding assistant. It describes the interaction, including its states, timings, touch and keyboard behavior, and reduced-motion fallback. |
| **Copy code** | The files used by the example, including styles and any local helpers, with a usage snippet, dependencies, and the applicable license. |
| **Install** | A shadcn-compatible registry command that copies the component, its styles, and its local helpers into the developer’s project. |

HeroUI Pro is the reference for the catalog and demo flow. Start with prompts
and source copy. Add CLI installation once a component builds in a fresh React
or Next.js project with the documented setup. [HeroUI Pro component grid](https://heroui.pro/docs/react/components) · [HeroUI Pro example page](https://heroui.pro/docs/react/components/area-chart) · [shadcn registry guide](https://ui.shadcn.com/docs/registry/getting-started)

## Page layout

1. **Catalog** at `/components`, linked from Browse. A wide, regular grid with
   three columns on desktop, two on tablet, and one on phones. Each card shows
   a still of the portfolio module, its name, and a short description. Group
   cards under Editorial, Navigation, and Motion and media. Use the site's warm
   palette, typography, spacing, and squircles.
2. **Component page** at `/components/<slug>`. Lead with a title, one sentence
   about its purpose, and **Copy prompt**. Keep the live demo visible above a
   separate TypeScript, CSS, and helper files. Each has a faded source excerpt,
   **View code** disclosure, and **Copy code**. The tabbed `LibraryLab`
   layout remains available for reuse. Give stateful demos **Reset** and give
   large demos **Open preview** if the inline space limits the interaction.
   Below the demo, add a usage snippet, the relevant inputs and dependencies,
   a license or upstream credit, and a **See it in use** link to the portfolio.
3. **Preview behavior.** Make touch, keyboard, light and dark themes, and
   reduced motion work as they do on the site. Load only the selected live demo.
   Use an isolated preview for global behaviors like fixed navigation, page
   scroll, and the pull-card transition so they can be replayed without affecting
   the surrounding documentation or portfolio state.

## First release

| Module | Interactive preview | What developers can take |
| --- | --- | --- |
| Notes | A real Notes card with a sample interaction recipe and working Copy prompt button. | The sample prompt, Notes component, and its styles. |
| Dynamic dock | Switch demo tabs, drag the active pill, and open a sample detail view to watch it contract into Back. | A prompt and a dock with configurable tabs, active state, and back action. The portfolio adapter supplies its routing, analytics, and AI trigger. |
| Flipbook | Turn sample pages with the loose corners, swipe on a phone, and try both covers with the spine attached. | A prompt, reader, fold geometry, CSS, and original sample pages with documented image inputs. |
| Pull card transition | Pull the original Home badge, release early to see it recoil and reverse the rainbow wave, then pull far enough to reveal the preview content. Reset to replay. Scroll the page from the space around the badge. | A prompt and a copyable example of the portfolio’s badge settings with a link to upstream Lanyard. |

Notes and Flipbook are the first candidates for reusable source. The dock
currently owns portfolio routes, tracking, audio, and the AI trigger. Extract
the interaction into a component that receives tabs and callbacks so the public
example and the live site can share it. Use the existing Notes recipe format so
prompts can carry the details from the case studies. [Case-study modules](case-study-modules.md)

## Remaining catalog inventory

| Group | Modules to add after the first release |
| --- | --- |
| Editorial | Thumbnail, Project figures, Link line, Section heading, Body text, Bullet list, Pull question, Stat row, Point row, Drawn point row, Step comparison, and image layouts. |
| Navigation | Browse shortcut groups and search, appearance settings, Home feed filters, section rail, Next-project scroll gate, and the AI composer, response, and contact handoff with sample data. |
| Motion and media | Video player and Framed recording, image zoom, thumbnail morph, sticker morph, progressive dock blur, press feedback, project cursor, Fun tile stack and silent video loop, Lottie sequence, ink sprite, ISD dot hero, comment-card scroll, signature reveal, shimmer links, and the Writing interaction demos. |

Show editorial primitives together as a working example of a case-study page,
with links to each recipe. Give distinct interactions their own catalog card
when they have something meaningful to try.

## Installable components and compact Settings

The component pages, Settings selects, and shadcn registry are implemented.
Notes, Dynamic dock, and Flipbook have install commands and manual source
files. A public release follows the source and license review. The same
source can support a versioned npm package.

### Installation

React Bits Lanyard uses a shadcn registry. Its CLI copies the component files
into the developer's project and installs the packages listed by the registry
item. The manual `npm install three` command shown in the reference installs
Three.js. [Lanyard installation](https://reactbits.dev/components/lanyard) · [shadcn registry guide](https://ui.shadcn.com/docs/registry/getting-started)

1. Prepare Notes as a self-contained registry pilot. Include its squircle
   helper, Phosphor icons, copy styles, and token defaults. Use one source
   manifest for the exact files shown on the site, files installed by the CLI,
   and required packages. Keep the live demo on the same implementation.
2. After verification and license review, serve a catalog and one public JSON
   item per approved component, with a copyable command like
   `npx shadcn@latest add https://www.mattmattdesign.com/r/notes.json`.
   Keep the manual instructions available beside the registry command.
   [Registry item schema](https://ui.shadcn.com/docs/registry/registry-item-json)
3. Dynamic dock ships its drag helper and scoped CSS module. Flipbook ships
   its fold helper and scoped CSS module. It uses browser images by default
   and supports a custom renderer. The portfolio supplies a Next.js adapter
   for image optimization.
4. For a versioned npm dependency, build those same exports in a separate
   workspace package while the portfolio remains private. Publish compiled
   JavaScript, TypeScript declarations, and explicit CSS exports. Declare
   React and React DOM as peer dependencies, and document the supported
   frameworks and versions. `@mattmattdesign/ui` is a proposed name, subject
   to npm scope availability. Test a local tarball before publishing the
   first release. [Publishing a scoped npm package](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)

Choose the license for Matt's original reusable code and review the files and
assets included in each release. Pull card transition shares a live demo, a
prompt, and a badge configuration example with upstream credit. The vendored Lanyard license restricts
standalone component redistribution. [React Bits license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)

### Component pages

- Keep the demo visible. Order the developer material below it as Install,
  Usage, Source, and Props. Show Install commands when the corresponding
  distribution is verified, and use the Props table for the supported API,
  including names, types, defaults, and descriptions.
- Replace the source picker with individually labeled TypeScript and CSS
  files. Each file has a **View code** disclosure and its own **Copy code**
  action. Include helpers under their real filenames. Expanded code reads at
  full height in the page. The reusable tabbed layout can render the same
  file blocks.

### Settings

- Extract the existing source picker as a controlled, labeled single-select
  component. Keep its matching squircle corners, selected check, and keyboard
  interaction. Use the selected option as the trigger value. [W3C select-only combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/)
- Replace the five radio rows in Settings with two compact rows. **Typeface**
  opens Allo and Helvetica Neue. **Theme** opens Auto, Light, and Dark. Keep
  the existing saved preferences, immediate updates, and Auto's system-theme
  behavior.

### Verification

- Install Notes in a fresh Next.js project and a fresh React project. Check
  that the documented imports, styles, copy action, and dependencies work
  without portfolio files. Apply the same checks to later registry items and
  to the packed npm package before listing those install commands.
- Check the file disclosures and both Settings selects at desktop and phone
  widths with touch, keyboard, and a screen reader. Confirm settings persist
  across reloads and the component preview state survives opening source.

## Implementation order

1. Define one catalog entry per module with a slug, group, preview, prompt,
   source availability, dependencies, credit, and link to where the site uses
   it. Add the catalog and detail routes with server-rendered titles and
   descriptions, and connect them to Browse and the sitemap.
2. Build the four demos using the working site components wherever practical.
   Drive both the visible recipe and clipboard text from one Markdown source.
   Use original sample text and media in examples that developers can copy.
3. Choose a license for the original code before publishing downloadables. A
   scoped MIT release for selected files is an option. Verify credits and asset
   rights per module. The vendored React Bits Lanyard license restricts
   standalone component redistribution. Provide a behavior recipe, a usage
   example, and a link to upstream. Check the distortion package and local patch separately before
   exposing any reusable implementation of the wave. [React Bits license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md) · [React Bits component catalog](https://reactbits.dev/get-started/index)
4. Verify the catalog at desktop and phone widths. Exercise the demo reset,
   clipboard output, mouse and touch interactions, keyboard focus, and reduced
   motion. Paste each public copyable example into a clean project and run it
   using only the listed dependencies and files.
5. Expand the catalog using the inventory above. When an item is ready for CLI
   distribution, generate its registry JSON from the same source files shown
   in Code and test the install in a clean project. [Registry item schema](https://ui.shadcn.com/docs/registry/registry-item-json)
