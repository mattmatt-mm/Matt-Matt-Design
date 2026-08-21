"use client";

import { type CSSProperties, useState } from "react";

export type DemoKind =
  | "easing"
  | "duration"
  | "press"
  | "transition"
  | "squash"
  | "anticipation"
  | "staging"
  | "stagger"
  | "arc"
  | "secondary"
  | "shake";

type Variant = {
  label: string;
  /** Class carrying the animation or interaction being demonstrated. */
  className: string;
  note: string;
  /** The replay target the animated parts sit in. */
  track?: string;
  /** Peers animating together — each one gets its index as `--i`. */
  parts?: number;
};

const REPLAY = "Tap either box to replay them together.";

const DEMOS: Record<DemoKind, { hint: string; variants: [Variant, Variant] }> = {
  easing: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-travel demo-travel--linear",
        note: "linear",
      },
      {
        label: "Do",
        className: "demo-travel demo-travel--eased",
        note: "ease-out",
      },
    ],
  },
  duration: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-travel demo-travel--slow",
        note: "640ms",
      },
      {
        label: "Do",
        className: "demo-travel demo-travel--quick",
        note: "160ms",
      },
    ],
  },
  press: {
    hint: "Press and hold either button.",
    variants: [
      { label: "Don't", className: "demo-press--dead", note: "no response" },
      { label: "Do", className: "demo-press", note: "instant in, 160ms out" },
    ],
  },
  transition: {
    hint: "Switch pages in either box — both follow, so the two stay comparable.",
    variants: [
      { label: "Don't", className: "", note: "cut" },
      // The real thing: the same class this site's own pages arrive with.
      { label: "Do", className: "page-slide", note: "240ms, from the tapped side" },
    ],
  },
  squash: {
    hint: REPLAY,
    variants: [
      { label: "Don't", className: "demo-square demo-fall", note: "rigid" },
      {
        label: "Do",
        className: "demo-square demo-fall--squash",
        note: "squash on landing",
      },
    ],
  },
  anticipation: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-travel demo-launch",
        note: "straight out",
      },
      {
        label: "Do",
        className: "demo-travel demo-launch--anticipated",
        note: "6px back first",
      },
    ],
  },
  staging: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-row demo-row--flat",
        note: "everything leads",
        track: "demo-rows",
        parts: 3,
      },
      {
        label: "Do",
        className: "demo-row demo-row--staged",
        note: "one leads",
        track: "demo-rows",
        parts: 3,
      },
    ],
  },
  stagger: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-row demo-row--together",
        note: "all at once",
        track: "demo-rows",
        parts: 3,
      },
      {
        label: "Do",
        className: "demo-row demo-row--staggered",
        note: "60ms apart",
        track: "demo-rows",
        parts: 3,
      },
    ],
  },
  arc: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-travel demo-arc--straight",
        note: "straight line",
      },
      {
        label: "Do",
        className: "demo-travel demo-arc--curved",
        note: "two curves, one arc",
      },
    ],
  },
  secondary: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-mark demo-mark--competing",
        note: "same size, same moment",
        parts: 2,
      },
      {
        label: "Do",
        className: "demo-mark demo-mark--supporting",
        note: "smaller, 160ms later",
        parts: 2,
      },
    ],
  },
  shake: {
    hint: REPLAY,
    variants: [
      {
        label: "Don't",
        className: "demo-square demo-square--tint",
        note: "colour only",
      },
      {
        label: "Do",
        className: "demo-square demo-square--shake",
        note: "4px shake",
      },
    ],
  },
};

/** Two stand-in pages. The bar widths are the only thing telling them apart. */
const PAGES = [
  { label: "Experience", bars: ["100%", "64%", "82%"] },
  { label: "Gallery", bars: ["72%", "100%", "56%"] },
];

type View = { page: number; direction: "forward" | "back" | null };

function SwapPane({
  variant,
  view,
  onSelect,
}: {
  variant: Variant;
  view: View;
  onSelect: (page: number) => void;
}) {
  // Nothing animates until the reader has actually changed page, so the first
  // paint is a cut in both boxes — the same rule the site itself follows.
  const animated = variant.className !== "" && view.direction !== null;

  return (
    <div>
      <p className="text-muted">{variant.label}</p>
      <div className="border-line mt-1 border p-3">
        <div className="flex gap-2">
          {PAGES.map((page, i) => (
            <button
              key={page.label}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={i === view.page}
              className={`px-1 ${i === view.page ? "text-fg" : "text-muted"}`}
            >
              {page.label}
            </button>
          ))}
        </div>

        {/* Keyed on the page so the arrival replays on every switch. */}
        <div
          key={view.page}
          className={`mt-3 flex flex-col gap-2 ${animated ? variant.className : ""}`}
          data-direction={animated ? view.direction : undefined}
          aria-hidden="true"
        >
          {PAGES[view.page].bars.map((width, i) => (
            <span key={i} className="bg-line block h-2" style={{ width }} />
          ))}
        </div>
      </div>
      <p className="text-muted mt-1">{variant.note}</p>
    </div>
  );
}

function Pane({
  variant,
  kind,
  plays,
  onReplay,
}: {
  variant: Variant;
  kind: DemoKind;
  plays: number;
  onReplay: () => void;
}) {
  const isPress = kind === "press";

  return (
    <div>
      <p className="text-muted">{variant.label}</p>
      <div className="border-line mt-1 flex h-24 items-center justify-center border">
        {isPress ? (
          <button
            type="button"
            className={`border-line border px-3 py-1 ${variant.className}`}
          >
            Press
          </button>
        ) : (
          <button
            type="button"
            onClick={onReplay}
            aria-label={`Replay the ${variant.label} example`}
            className={variant.track ?? "demo-track"}
          >
            {/* the key restarts the CSS animation on each replay */}
            {Array.from({ length: variant.parts ?? 1 }, (_, i) => (
              <span
                key={`${plays}-${i}`}
                className={`demo-anim ${variant.className}`}
                style={{ "--i": i } as CSSProperties}
              />
            ))}
          </button>
        )}
      </div>
      <p className="text-muted mt-1">{variant.note}</p>
    </div>
  );
}

export function Demo({ kind }: { kind: DemoKind }) {
  const [plays, setPlays] = useState(0);
  // Shared by both panes, so the comparison is always like for like.
  const [view, setView] = useState<View>({ page: 0, direction: null });
  const demo = DEMOS[kind];

  function select(page: number) {
    setView((prev) =>
      prev.page === page
        ? prev
        : { page, direction: page > prev.page ? "forward" : "back" },
    );
  }

  return (
    <div className="demo">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 [&>*]:sm:flex-1">
        {demo.variants.map((variant) =>
          kind === "transition" ? (
            <SwapPane
              key={variant.label}
              variant={variant}
              view={view}
              onSelect={select}
            />
          ) : (
            <Pane
              key={variant.label}
              variant={variant}
              kind={kind}
              plays={plays}
              onReplay={() => setPlays((n) => n + 1)}
            />
          ),
        )}
      </div>
      <p className="text-muted mt-3">{demo.hint}</p>
    </div>
  );
}
