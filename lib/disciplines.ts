/**
 * The kinds of work a guided tour can be narrowed to. Shared by the Keystatic
 * field, the tour chips and the `/tour/<focus>` route, so all three agree on
 * the values and their order. See doc/hr-mode-plan.md.
 */
export const DISCIPLINES = [
  { value: "branding", label: "Branding" },
  { value: "uiux", label: "UI/UX" },
  { value: "frontend", label: "Frontend development" },
] as const;

export type Discipline = (typeof DISCIPLINES)[number]["value"];

const ORDER: Discipline[] = DISCIPLINES.map((d) => d.value);

/** The route segment for a selection: fixed order, joined by `-`. */
export function focusSlug(picks: Iterable<Discipline>): string {
  const chosen = new Set(picks);
  return ORDER.filter((d) => chosen.has(d)).join("-");
}

/** The reverse of `focusSlug`, or null when the segment is not canonical. */
export function parseFocus(slug: string): Discipline[] | null {
  const parts = slug.split("-") as Discipline[];
  if (!parts.length || parts.some((p) => !ORDER.includes(p))) return null;
  return focusSlug(parts) === slug ? parts : null;
}

/** Every non-empty selection, for prerendering. */
export function allFocusSlugs(): string[] {
  const slugs: string[] = [];
  for (let mask = 1; mask < 1 << ORDER.length; mask++) {
    slugs.push(focusSlug(ORDER.filter((_, i) => mask & (1 << i))));
  }
  return slugs;
}

export function disciplineLabel(value: Discipline): string {
  return DISCIPLINES.find((d) => d.value === value)?.label ?? value;
}

/**
 * The line over a walkthrough's first title — on the page and on the splash
 * that hands off to it, which glides one onto the other, so they must match.
 */
export function walkthroughEyebrow(picks: Discipline[]): string {
  const covers = new Intl.ListFormat("en", { type: "conjunction" }).format(
    picks.map(disciplineLabel),
  );
  return `Walkthrough · ${covers}`;
}
