import type { ModuleSlug } from "./component-library";

type ReleaseLink = { label: string; href: `/${string}` };
type ReleaseParagraph = readonly (string | ReleaseLink)[];
export type ReleasePreview = { slug: ModuleSlug | "dock-transition"; title: string };
type Release = {
  patch: number;
  date: string;
  title: string;
  summary: string;
  changes?: readonly ReleaseParagraph[];
  previews?: readonly ReleasePreview[];
};

export function releaseVersion(patch: number) {
  return `v0.1.${patch}`;
}

// Add one authored note per visitor-facing PR, newest first.
export const releases: readonly Release[] = [
  {
    patch: 14,
    date: "2026-11-26",
    title: "Component library and dock navigation",
    summary: "Try the interactions that appear across the portfolio. Detail pages now put Home next to Back, and Back returns you to the page and scroll position you came from. All four dock tabs now share the same slide and blur when you switch sections.",
    changes: [
      [
        { label: "Notes", href: "/components/notes" },
        " copies an interaction recipe as Markdown. See the original Notes cards in ",
        { label: "Incipe Workspace", href: "/work/incipe-workspace" },
        ".",
      ],
      [
        "Drag the active tab in the ",
        { label: "Dynamic Dock demo", href: "/components/dynamic-dock" },
        ", then open a detail to try Back and Home. The compact dock is also on ",
        { label: "What a transition is for", href: "/writing/what-a-transition-is-for" },
        ".",
      ],
      [
        "Turn pages with a drag or the arrow keys in the ",
        { label: "Flipbook demo", href: "/components/flipbook" },
        ". The original book appears in ",
        { label: "A century of flavour and tradition", href: "/fun/chan-kee-pattern" },
        ".",
      ],
      [
        "Pull the badge down in the ",
        { label: "Pull card transition demo", href: "/components/pull-card-transition" },
        " to reveal the next view. The original opens ",
        { label: "Home", href: "/" },
        " on a fresh visit.",
      ],
    ],
    previews: [
      { slug: "dock-transition", title: "dock transition" },
      { slug: "pull-card-transition", title: "Pull card transition" },
      { slug: "notes", title: "Notes" },
      { slug: "dynamic-dock", title: "Dynamic Dock" },
      { slug: "flipbook", title: "Flipbook" },
    ],
  },
  {
    patch: 13,
    date: "2026-11-22",
    title: "Home splash",
    summary: "Refined how the lanyard badge enters on Home and transitions into the portfolio.",
  },
  {
    patch: 12,
    date: "2026-11-22",
    title: "Profile badge and appearance settings",
    summary: "Introduced the interactive lanyard badge, added theme and typeface controls, and updated Writing and the case study layouts.",
  },
  {
    patch: 11,
    date: "2026-11-21",
    title: "Interactive photobook",
    summary: "Added the Chan Kee photobook with draggable page turns and responsive spreads, and unified the profile and walkthrough labels.",
  },
  {
    patch: 10,
    date: "2026-11-21",
    title: "Browse and case study navigation",
    summary: "Introduced Browse and portfolio search, refined the guided walkthrough, and updated case study navigation.",
  },
  {
    patch: 9,
    date: "2026-10-22",
    title: "Fun gallery and AI conversations",
    summary: "Added a masonry gallery for side projects and gave the AI a shared briefing and conversational memory.",
  },
  {
    patch: 8,
    date: "2026-10-21",
    title: "Comments dashboard",
    summary: "Made profile comments editable in Keystatic and updated the displayed star ratings.",
  },
  {
    patch: 7,
    date: "2026-10-21",
    title: "New profile comment",
    summary: "Added Vivi’s comment to the profile.",
  },
  {
    patch: 6,
    date: "2026-10-21",
    title: "Profile comments",
    summary: "Added a diagonal, scroll-driven display of client comments below the profile.",
  },
  {
    patch: 5,
    date: "2026-10-19",
    title: "Illustrations and AI surfaces",
    summary: "Added engraved graphics and a growing-tree 404 animation, and refined the AI controls and their elevation.",
  },
  {
    patch: 4,
    date: "2026-10-18",
    title: "Search and sharing",
    summary: "Added structured metadata, a sitemap, a public content summary for AI crawlers, and richer Writing share previews.",
  },
  {
    patch: 3,
    date: "2026-10-18",
    title: "Notes and dock transitions",
    summary: "Animated the Notes copy confirmation and kept the dock and page fade visible during thumbnail transitions.",
  },
  {
    patch: 2,
    date: "2026-10-18",
    title: "Guided walkthrough",
    summary: "Added opt-in analytics, a checklist of disciplines, and a guided route through matching case studies.",
  },
  {
    patch: 1,
    date: "2026-09-05",
    title: "Navigation tabs",
    summary: "Refined the dock and the transition between expanded tabs and the compact navigation.",
  },
];
