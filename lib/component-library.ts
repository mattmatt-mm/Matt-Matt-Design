import type { Metadata } from "next";
import { siteName, siteSocialImage } from "@/lib/site";

export const componentsPath = "/components";
export const componentLibraryTitle = "React Component Library";
export const componentLibraryDescription = "Try the interactions used across the portfolio, from copying a motion recipe to pulling the badge that opens Home.";
const phosphorDependency = "@phosphor-icons/react@^2.1.10";

export function componentPageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      siteName,
      locale: "en_US",
      images: [siteSocialImage],
    },
  };
}

export const componentCatalog = [
  {
    slug: "notes",
    title: "Notes",
    searchTitle: "Notes Card with Markdown Copy for React",
    group: "Editorial",
    description: "Copy an interaction recipe as Markdown from the ruled Notes card used in the case studies.",
    instruction: "Copy the sample recipe from the note.",
    exampleHref: "/work/incipe-workspace",
    dependencies: "React, TypeScript, Phosphor Icons, and @squircle-js/react",
    installDependencies: [phosphorDependency, "@squircle-js/react@1.3.0"],
    usage: 'import { Notes } from "@/components/notes/Notes";\n\n<Notes title="Motion recipe">\n  <p>Describe your interaction here.</p>\n  <ul><li>One behavior per line.</li></ul>\n</Notes>',
    props: [
      { name: "title", type: "string", defaultValue: '"Notes"', description: "Sets the band title and accessible name." },
      { name: "children", type: "ReactNode", defaultValue: "Required", description: "The note body. Top-level lists are copied with Markdown list markers." },
    ],
    prompt: [
      "Build a reusable Notes card for documenting an interaction.",
      [
        "- Use a 48 px title band, a perforated seam, and paper ruled at a 21 px line height.",
        "- Copy the full recipe as Markdown, including list markers, with one button.",
        "- Swap the copy icon for a check for two seconds after success. Keep the button keyboard accessible and honor reduced motion.",
      ].join("\n"),
    ].join("\n\n"),
  },
  {
    slug: "dynamic-dock",
    title: "Dynamic dock",
    searchTitle: "Dynamic Dock Navigation for React",
    group: "Navigation",
    description: "Drag the active tab to switch sections, or open a detail to see the dock contract to Back and Home.",
    instruction: "Drag the active tab, or open a detail to try Back and Home.",
    exampleHref: "/writing/what-a-transition-is-for",
    dependencies: "React 19, TypeScript, Phosphor Icons, and CSS Modules",
    installDependencies: [phosphorDependency],
    usage: [
      '"use client";',
      '',
      'import { House } from "@phosphor-icons/react/dist/ssr/House";',
      'import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";',
      'import { useState } from "react";',
      'import { DynamicDock } from "@/components/dynamic-dock/DynamicDock";',
      '',
      'const tabs = [{ label: "Home", icon: House }, { label: "Browse", icon: MagnifyingGlass }];',
      '',
      'export function Example() {',
      '  const [activeIndex, setActiveIndex] = useState(0);',
      '  const [detail, setDetail] = useState(false);',
      '  function goHome() {',
      '    setActiveIndex(0);',
      '    setDetail(false);',
      '  }',
      '  return (',
      '    <>',
      '      <button onClick={() => setDetail(true)}>Open detail</button>',
      '      <DynamicDock tabs={tabs} activeIndex={activeIndex} detail={detail}',
      '        onSelect={setActiveIndex} onBack={() => setDetail(false)} onHome={goHome} />',
      '    </>',
      '  );',
      '}',
    ].join("\n"),
    props: [
      { name: "tabs", type: "readonly { label: string; icon: Icon }[]", defaultValue: "Required", description: "The ordered Phosphor icons and accessible tab names." },
      { name: "activeIndex", type: "number", defaultValue: "Required", description: "The zero-based index of the selected tab." },
      { name: "detail", type: "boolean", defaultValue: "Required", description: "Switches to the compact controls when true." },
      { name: "onSelect", type: "(index: number) => void", defaultValue: "Required", description: "Receives the tab index after a click or drag." },
      { name: "onBack", type: "() => void", defaultValue: "Required", description: "Handles activation of the Back control." },
      { name: "onHome", type: "() => void", defaultValue: "undefined", description: "Adds the Home control to the compact dock and handles its activation." },
      { name: "className", type: "string", defaultValue: "undefined", description: "Adds a class to the outer dock for placement." },
      { name: "label", type: "string", defaultValue: '"Navigation"', description: "Names the navigation landmark." },
    ],
    prompt: [
      "Build a capsule navigation dock with four icon tabs and a shared active pill.",
      "- Set desktop tabs to 60 × 40 px with 4 px of dock padding. Slide the pill between columns in 250 ms.",
      "- Let the active tab follow a horizontal mouse or touch drag. Stretch the pill with resistance past either edge and snap to the release column.",
      "- Contract the bar into a compact capsule with Back and an optional Home control over 300 ms on detail views. Add accessible names and support keyboard navigation and reduced motion.",
    ].join("\n\n"),
  },
  {
    slug: "flipbook",
    title: "Flipbook",
    searchTitle: "React Flipbook with Draggable Page Turns",
    group: "Motion and media",
    description: "Turn the pages of the portfolio’s flipbook by dragging a corner or using the arrow keys. The spine stays in place as each page folds.",
    instruction: "Turn a page by dragging its loose bottom corner or using the arrows.",
    exampleHref: "/fun/chan-kee-pattern",
    dependencies: "React, TypeScript, Phosphor Icons, and CSS Modules",
    installDependencies: [phosphorDependency],
    usage: [
      'import { Photobook } from "@/components/flipbook/Photobook";',
      '',
      'const pages = [',
      '  { src: "/book/cover.webp", alt: "Front cover", width: 800, height: 1100 },',
      '  { src: "/book/page-2.webp", alt: "A drawing of a circle", width: 800, height: 1100 },',
      '  { src: "/book/page-3.webp", alt: "A drawing of an arc", width: 800, height: 1100 },',
      '  { src: "/book/back.webp", alt: "Back cover", width: 800, height: 1100 },',
      '];',
      '',
      '<Photobook label="Sample book" pages={pages} />',
    ].join("\n"),
    props: [
      { name: "pages", type: "readonly PhotobookPage[]", defaultValue: "Required", description: "Images in reading order, from front cover to back cover. Each has src, alt, width, and height." },
      { name: "id", type: "string", defaultValue: "undefined", description: "An optional anchor for linking directly to the reader." },
      { name: "label", type: "string", defaultValue: '"Photobook"', description: "The accessible name of the reader." },
      { name: "imageRenderer", type: "ComponentType<PhotobookImageProps>", defaultValue: '"img"', description: "Optionally renders pages with your framework’s image component. Pass it from a client component." },
    ],
    prompt: [
      "Build an interactive book reader from an ordered list of portrait page images.",
      "- Center the front and back covers. Pair the interior pages on wide layouts and show one page at a time on a phone.",
      "- Hold the binding in place. Fold only from the loose corner and constrain the crease so the spine never lifts.",
      "- Separate facing pages with a fine spine line and a light crease shadow. Deepen the shadow as the page lifts and soften it as the spread settles flat.",
      "- Keep the spine seam beneath the lifted sheet. Dim the front of the turning page and the page it reveals by the same amount. Keep the facing page and the back of the lifted sheet fully lit.",
      "- Commit after a drag of 42% of the page width. Return a short drag to its starting position. Support arrow keys, touch swipes, page counts, and a reduced-motion fallback.",
    ].join("\n\n"),
  },
  {
    slug: "pull-card-transition",
    title: "Pull card transition",
    searchTitle: "Pull Card Transition Demo for React",
    group: "Motion and media",
    description: "Pull the hanging badge to reveal Home through a color wave. A short pull lets the badge spring back.",
    instruction: "Pull the card down and release. A short pull springs back.",
    exampleHref: "/",
    usage: `"use client";

import Lanyard from "./Lanyard";

type BadgeArtwork = { frontImage: string; backImage?: string };

export function PortfolioBadge({ frontImage, backImage }: BadgeArtwork) {
  return (
    <div style={{ height: "clamp(320px, 72svh, 544px)" }}>
      <Lanyard
        frontImage={frontImage}
        backImage={backImage}
        finish="matte"
        size={0.74}
        strapLength={0.24}
        strapWidth={0.6}
        damping={0.58}
        breeze={0}
        intro={false}
      />
    </div>
  );
}`,
    prompt: [
      "Build a pull-to-enter transition around a suspended card.",
      "- Capture the pointer while dragging. Let the card track the movement and let the strap stretch with it.",
      "- Drive the strength of a colorful wave with pull distance. A short release returns the card to rest. A full release starts the reveal from the release point.",
      "- Provide a keyboard-accessible way to enter and a reset for the demo. With reduced motion, switch views immediately.",
    ].join("\n\n"),
  },
] as const;

export type LibraryModule = (typeof componentCatalog)[number];
export type ModuleSlug = LibraryModule["slug"];
export type InstallableModule = Extract<LibraryModule, { installDependencies: readonly string[] }>;
export type SourceFile = { name: string; text: string };

export const installableComponents = componentCatalog.filter(
  (component): component is InstallableModule => "installDependencies" in component,
);

export function libraryRegistryPath(slug: InstallableModule["slug"]) {
  return `/r/${slug}.json`;
}

export function getLibraryModule(slug: string) {
  return componentCatalog.find((component) => component.slug === slug);
}
