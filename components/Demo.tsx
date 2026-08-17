"use client";

import { useState } from "react";

export type DemoKind = "easing" | "duration" | "press";

type Variant = {
  label: string;
  /** Class carrying the animation or interaction being demonstrated. */
  className: string;
  note: string;
};

const DEMOS: Record<DemoKind, { replayable: boolean; variants: [Variant, Variant] }> = {
  easing: {
    replayable: true,
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
    replayable: true,
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
    replayable: false,
    variants: [
      { label: "Don't", className: "demo-press--dead", note: "no response" },
      { label: "Do", className: "demo-press", note: "instant in, 160ms out" },
    ],
  },
};

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
            className="demo-track"
          >
            {/* the key restarts the CSS animation on each replay */}
            <span key={plays} className={variant.className} />
          </button>
        )}
      </div>
      <p className="text-muted mt-1">{variant.note}</p>
    </div>
  );
}

export function Demo({ kind }: { kind: DemoKind }) {
  const [plays, setPlays] = useState(0);
  const demo = DEMOS[kind];

  return (
    <div className="demo">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 [&>*]:sm:flex-1">
        {demo.variants.map((variant) => (
          <Pane
            key={variant.label}
            variant={variant}
            kind={kind}
            plays={plays}
            onReplay={() => setPlays((n) => n + 1)}
          />
        ))}
      </div>
      <p className="text-muted mt-3">
        {demo.replayable
          ? "Tap either box to replay them together."
          : "Press and hold either button."}
      </p>
    </div>
  );
}
