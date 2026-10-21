import { config, fields, collection, singleton } from "@keystatic/core";
import { block, repeating, wrapper } from "@keystatic/core/content-components";
import { DISCIPLINES } from "./lib/disciplines";

/**
 * A row of figures for a case study or post. `stats` holds two to four `stat`
 * blocks; components/Stats.tsx renders them.
 */
/**
 * Lottie clips that play one after another and loop: `lottie` holds the
 * `clip` blocks in order; components/LottieSequence.tsx plays them.
 */
const lottieComponents = {
  lottie: repeating({
    label: "Lottie sequence",
    description: "Lottie animations that play one after another, then loop.",
    children: ["clip"],
    validation: { children: { min: 1, max: 8 } },
    schema: {
      title: fields.text({
        label: "Description",
        description: "What the animation shows, for screen readers.",
      }),
    },
  }),
  clip: block({
    label: "Lottie clip",
    description: "One Lottie file (.json) inside a Lottie sequence.",
    schema: {
      src: fields.file({
        label: "Lottie file (.json)",
        directory: "public/lottie",
        publicPath: "/lottie/",
        validation: { isRequired: true },
      }),
    },
  }),
};

/**
 * Short points in equal columns (`points` of `point`), and a problem drawn as
 * two step lists meeting in one outcome (`flows` of `flow`).
 * components/Points.tsx and components/Flows.tsx render them.
 */
const explainerComponents = {
  "isd-hero": block({
    label: "ISD dot hero",
    description:
      "The animated ISD dot story (one dot to the ISD logo). Built for the HKUST AIS case study; place it above the first section to open the page with it.",
    schema: {},
  }),
  notes: wrapper({
    label: "Notes",
    description:
      "The exact numbers behind an interaction, as an Apple Notes card with a Copy prompt button. Write it as an instruction someone could paste into their AI.",
    schema: {
      title: fields.text({ label: "Title", description: "e.g. Panel recipe" }),
    },
  }),
  points: repeating({
    label: "Points",
    description:
      "Two to four short points side by side: a process, principles, insights or lessons.",
    children: ["point"],
    validation: { children: { min: 2, max: 4 } },
    schema: {},
  }),
  point: block({
    label: "Point",
    description: "One point inside Points.",
    schema: {
      title: fields.text({
        label: "Title",
        description: "Two to four words, in black. e.g. Think in systems",
        validation: { isRequired: true },
      }),
      text: fields.text({
        label: "Line",
        description: "One sentence, in grey, under the title.",
      }),
      figure: fields.select({
        label: "Drawing",
        description: "An optional line drawing above the title.",
        options: [
          { label: "None", value: "" },
          { label: "A pile of people", value: "crowd" },
          { label: "Promises slipping off a line", value: "promises" },
          { label: "Screens against one message", value: "message" },
        ],
        defaultValue: "",
      }),
    },
  }),
  flows: repeating({
    label: "Step comparison",
    description:
      "Two lists of steps side by side that end in one shared step, e.g. the old way against yours.",
    children: ["flow"],
    validation: { children: { min: 2, max: 2 } },
    schema: {
      outcome: fields.text({
        label: "Shared last step",
        description: "Where both lists end up. e.g. Integrate, deploy & test",
      }),
      note: fields.text({
        label: "Note",
        description: "Grey line under the shared step.",
      }),
    },
  }),
  flow: block({
    label: "Step list",
    description: "One side of a Step comparison.",
    schema: {
      title: fields.text({
        label: "Title",
        validation: { isRequired: true },
      }),
      steps: fields.text({
        label: "Steps",
        description: "Separate the steps with a | e.g. Wire the sensor | Install drivers",
        validation: { isRequired: true },
      }),
    },
  }),
};

const statsComponents = {
  stats: repeating({
    label: "Stats",
    description: "Two to four figures in a row, e.g. revenue or users.",
    children: ["stat"],
    validation: { children: { min: 2, max: 4 } },
    schema: {},
  }),
  stat: block({
    label: "Stat",
    description: "One figure inside Stats.",
    schema: {
      value: fields.text({
        label: "Figure",
        description: "The number, in black. e.g. US$48K",
        validation: { isRequired: true },
      }),
      label: fields.text({
        label: "Caption",
        description: "The grey line under it. e.g. revenue in three months",
      }),
    },
  }),
};

/**
 * GitHub storage everywhere, so /keystatic behaves the same locally and live.
 * Running `pnpm dev` with no credentials shows Keystatic's setup wizard, which
 * creates the GitHub app and writes the KEYSTATIC_* values into .env.
 *
 * `KEYSTATIC_STORAGE=local pnpm dev` edits the files on disk directly instead,
 * with no GitHub account involved.
 */
const storage =
  process.env.KEYSTATIC_STORAGE === "local"
    ? ({ kind: "local" } as const)
    : ({
        kind: "github",
        repo: { owner: "mattmatt-mm", name: "Matt-Matt-Design" },
      } as const);

export default config({
  storage,

  ui: {
    brand: { name: "mattmattdesign" },
    navigation: {
      Content: ["experience", "gallery", "writing"],
      Site: ["settings", "aiKnowledge"],
    },
  },

  singletons: {
    settings: singleton({
      label: "Site settings",
      path: "content/settings",
      format: { data: "yaml" },
      schema: {
        name: fields.text({ label: "Name" }),
        role: fields.text({ label: "Role" }),
        intro: fields.array(
          fields.text({ label: "Paragraph", multiline: true }),
          {
            label: "Intro paragraphs",
            itemLabel: (props) => props.value.slice(0, 48) || "Empty",
          },
        ),
        socials: fields.array(
          fields.object({
            label: fields.text({ label: "Label" }),
            url: fields.url({ label: "URL" }),
          }),
          {
            label: "Social links",
            itemLabel: (props) => props.fields.label.value || "Link",
          },
        ),
        email: fields.text({ label: "Email" }),
      },
    }),
    aiKnowledge: singleton({
      label: "AI knowledge",
      path: "content/ai-knowledge",
      format: { data: "yaml" },
      schema: {
        reviewedAt: fields.date({
          label: "Knowledge set reviewed",
          description:
            "Review the complete set on this date before publishing changes.",
        }),
        voiceRules: fields.array(fields.text({ label: "Rule" }), {
          label: "Voice rules",
          itemLabel: (props) => props.value || "Rule",
        }),
        unknownFallback: fields.text({
          label: "Unknown-information fallback",
          multiline: true,
          description:
            "Meaning to preserve in the visitor's language. The model may translate it but may not add facts.",
        }),
        facts: fields.array(
          fields.object({
            id: fields.text({
              label: "Internal ID",
              description: "Stable lowercase ID, for example current-role.",
            }),
            topic: fields.text({ label: "Topic" }),
            aliases: fields.array(fields.text({ label: "Phrase" }), {
              label: "Visitor phrases",
              itemLabel: (props) => props.value || "Phrase",
            }),
            policy: fields.select({
              label: "Policy",
              options: [
                { label: "Answer from approved text", value: "answer" },
                { label: "Ask the visitor to contact Matt", value: "contact_only" },
                { label: "Never answer", value: "never_answer" },
              ],
              defaultValue: "answer",
            }),
            answer: fields.text({
              label: "Approved fact",
              multiline: true,
              description: "Required only when Policy is Answer.",
            }),
            source: fields.text({
              label: "Source",
              description: "Portfolio route or note supporting this fact.",
            }),
            lastReviewed: fields.date({ label: "Last reviewed" }),
          }),
          {
            label: "Approved facts and policies",
            itemLabel: (props) =>
              props.fields.topic.value || props.fields.id.value || "Fact",
          },
        ),
      },
    }),
  },

  collections: {
    experience: collection({
      label: "Experience",
      path: "content/experience/*",
      slugField: "title",
      format: { contentField: "body" },
      columns: ["title", "label"],
      schema: {
        title: fields.slug({
          name: { label: "Title" },
          slug: {
            label: "URL slug",
            description: "The web address for this entry's page.",
          },
        }),
        label: fields.text({
          label: "Label",
          multiline: true,
          description:
            "The grey text on the left, e.g. 2026 or Hobby. Entries with the same label are grouped together, and only the first one shows it.",
        }),
        order: fields.integer({
          label: "Sort order",
          defaultValue: 0,
          description: "Higher numbers appear higher up the list.",
        }),
        start: fields.text({
          label: "Start",
          description:
            "When the project began. Shown under the title as the Timeline, e.g. Sep 2025 – Feb 2026",
        }),
        end: fields.text({
          label: "End",
          description: "When it ended, e.g. Feb 2026, or Present.",
        }),
        role: fields.text({
          label: "Role",
          description: "What you did, shown under the title. e.g. Product, UI/UX, Website",
        }),
        team: fields.text({
          label: "Team",
          description: "Who you worked with, e.g. 10 people",
        }),
        hasPage: fields.checkbox({
          label: "Give this entry its own page",
          defaultValue: true,
        }),
        externalUrl: fields.url({
          label: "External link",
          description:
            "If set, the row links here instead of to a page on this site.",
        }),
        disciplines: fields.multiselect({
          label: "Disciplines",
          description:
            "Which guided-tour chips this case study appears under. Never shown on the page.",
          options: DISCIPLINES.map((d) => ({ label: d.label, value: d.value })),
        }),
        summary: fields.text({ label: "Summary", multiline: true }),
        cover: fields.image({
          label: "Cover image",
          directory: "public/images/experience",
          publicPath: "/images/experience/",
        }),
        body: fields.markdoc({
          label: "Body",
          components: {
            ...statsComponents,
            ...explainerComponents,
            ...lottieComponents,
            // Registered so the editor offers it and keeps the tag on save.
            video: block({
              label: "Video",
              description:
                "A screen recording with play, scrub and fullscreen controls. It plays silently while on screen.",
              schema: {
                src: fields.file({
                  label: "Video file (.mp4)",
                  directory: "public/videos/experience",
                  publicPath: "/videos/experience/",
                  validation: { isRequired: true },
                }),
                poster: fields.image({
                  label: "Still image",
                  description:
                    "Shown before the video loads. Optional, but avoids a black box on slow connections.",
                  directory: "public/videos/experience",
                  publicPath: "/videos/experience/",
                }),
                title: fields.text({
                  label: "Description",
                  description: "What the recording shows, for screen readers.",
                }),
                caption: fields.text({
                  label: "Caption",
                  description:
                    "A few words shown above the recording, e.g. \"Live board preview\". With a caption the recording is filed under a caption tab; without one it is the bare player.",
                }),
              },
            }),
          },
        }),
      },
    }),

    gallery: collection({
      label: "Gallery",
      path: "content/gallery/*",
      slugField: "caption",
      format: { data: "yaml" },
      columns: ["caption", "projectName"],
      schema: {
        caption: fields.slug({ name: { label: "Caption" } }),
        projectName: fields.text({
          label: "Project name",
          description: "The grey second line under the caption.",
        }),
        project: fields.relationship({
          label: "Links to case study",
          collection: "experience",
          description:
            "Optional. Pick an Experience entry and this image becomes a link to it. Ignored if that entry has no page of its own.",
        }),
        externalUrl: fields.url({
          label: "External link",
          description:
            "Optional. If set, the image links to this website in a new tab, instead of to a case study.",
        }),
        image: fields.image({
          label: "Image",
          directory: "public/images/gallery",
          publicPath: "/images/gallery/",
          description: "Leave empty to show a grey placeholder for now.",
        }),
        alt: fields.text({
          label: "Alt text",
          description:
            "Describe the image for people using a screen reader. Please fill this in whenever there is an image.",
        }),
        date: fields.date({
          label: "Date",
          description: "Newest first.",
        }),
      },
    }),

    comments: collection({
      label: "Comments",
      path: "content/comments/*",
      slugField: "name",
      format: { data: "yaml" },
      columns: ["name", "role"],
      schema: {
        name: fields.slug({
          name: {
            label: "Name",
            description: "First name only, as it appears on the card.",
          },
        }),
        role: fields.text({
          label: "Role",
          description: "The grey line under the name, e.g. CEO, Neardeal.",
        }),
        comment: fields.text({
          label: "Comment",
          multiline: true,
          description:
            "In their own words. Line breaks show as typed; an empty line leaves a gap.",
        }),
        rating: fields.select({
          label: "Stars",
          options: [
            { label: "None", value: "" },
            { label: "5", value: "5" },
            { label: "4.5", value: "4.5" },
            { label: "4", value: "4" },
            { label: "3.5", value: "3.5" },
            { label: "3", value: "3" },
          ],
          defaultValue: "5",
        }),
        logo: fields.image({
          label: "Logo",
          directory: "public/images/comments",
          publicPath: "/images/comments/",
          description: "A square logo or picture. Leave empty to show initials.",
        }),
        initials: fields.text({
          label: "Initials",
          description: "Shown when there is no logo, e.g. Yo.",
        }),
        order: fields.integer({
          label: "Order",
          description: "Lower comes first.",
          defaultValue: 1,
        }),
      },
    }),

    writing: collection({
      label: "Writing",
      path: "content/writing/*",
      slugField: "title",
      format: { contentField: "body" },
      columns: ["title", "publishedAt"],
      schema: {
        title: fields.slug({
          name: { label: "Title" },
          slug: {
            label: "URL slug",
            description:
              "The web address for this post. For a Chinese title, type an English slug here yourself.",
          },
        }),
        lang: fields.select({
          label: "Language",
          options: [
            { label: "English", value: "en" },
            { label: "繁體中文", value: "zh" },
          ],
          defaultValue: "en",
        }),
        publishedAt: fields.date({
          label: "Published",
          description:
            "Also sets the grey month on the left of the Writing list, e.g. 26 Aug. Posts from the same month are grouped.",
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: "Draft",
          defaultValue: false,
          description: "Drafts are hidden on the live site.",
        }),
        summary: fields.text({
          label: "Summary",
          multiline: true,
          description:
            "One or two sentences on what the post is about, shown by Google and on share cards. Write it in the post's own language. Leave empty to use the first paragraph.",
        }),
        cover: fields.image({
          label: "Share image",
          directory: "public/images/writing",
          publicPath: "/images/writing/",
          description:
            "Shown when the post is shared. Never shown on the page. Leave empty to use the site's default card.",
        }),
        body: fields.markdoc({
          label: "Body",
          components: {
            ...statsComponents,
            ...explainerComponents,
            // Registered here too, so the editor keeps the tag intact on save
            // rather than treating it as unknown markup.
            demo: block({
              label: "Interactive example",
              description:
                "A side-by-side Don't/Do example the reader can play with.",
              schema: {
                kind: fields.select({
                  label: "Example",
                  options: [
                    { label: "Easing — linear vs ease-out", value: "easing" },
                    { label: "Duration — too slow vs right", value: "duration" },
                    { label: "Press — dead vs responsive", value: "press" },
                    {
                      label: "Transition — cut vs slide",
                      value: "transition",
                    },
                    {
                      label: "Squash — rigid vs deforming",
                      value: "squash",
                    },
                    {
                      label: "Anticipation — straight out vs wind-up",
                      value: "anticipation",
                    },
                    {
                      label: "Staging — everything leads vs one leads",
                      value: "staging",
                    },
                    {
                      label: "Stagger — together vs 60ms apart",
                      value: "stagger",
                    },
                    {
                      label: "Arcs — straight vs curved",
                      value: "arc",
                    },
                    {
                      label: "Secondary — competing vs supporting",
                      value: "secondary",
                    },
                    {
                      label: "Exaggeration — tint vs shake",
                      value: "shake",
                    },
                  ],
                  defaultValue: "easing",
                }),
              },
            }),
          },
        }),
      },
    }),
  },
});
