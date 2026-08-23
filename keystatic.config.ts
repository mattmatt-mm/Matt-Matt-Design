import { config, fields, collection, singleton } from "@keystatic/core";
import { block } from "@keystatic/core/content-components";

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
        hasPage: fields.checkbox({
          label: "Give this entry its own page",
          defaultValue: true,
        }),
        externalUrl: fields.url({
          label: "External link",
          description:
            "If set, the row links here instead of to a page on this site.",
        }),
        summary: fields.text({ label: "Summary", multiline: true }),
        cover: fields.image({
          label: "Cover image",
          directory: "public/images/experience",
          publicPath: "/images/experience/",
        }),
        body: fields.markdoc({ label: "Body" }),
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

    writing: collection({
      label: "Writing",
      path: "content/writing/*",
      slugField: "title",
      format: { contentField: "body" },
      columns: ["title", "label"],
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
        label: fields.text({
          label: "Label",
          multiline: true,
          description:
            "The grey text on the left, e.g. 26 and Spring on two lines. Posts sharing a label are grouped.",
        }),
        publishedAt: fields.date({
          label: "Published",
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: "Draft",
          defaultValue: false,
          description: "Drafts are hidden on the live site.",
        }),
        body: fields.markdoc({
          label: "Body",
          components: {
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
