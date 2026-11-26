/**
 * The filters across the top of the Fun tab, in order. Shared by the
 * Keystatic field and the filter row, so both agree on values and order.
 * See doc/fun-tab-plan.md.
 */
export const FUN_CATEGORIES = [
  { value: "3d", label: "3D" },
  { value: "motion", label: "Motion" },
  { value: "illustration", label: "Illustration" },
] as const;

export type FunCategory = (typeof FUN_CATEGORIES)[number]["value"];
