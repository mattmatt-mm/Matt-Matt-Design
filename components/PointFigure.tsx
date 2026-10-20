/**
 * Small line drawings that sit above a point: {% point figure="crowd" … /%}.
 * Drawn in the site's own tokens — fg, muted and the hairline colour on a
 * 1px ground rule — rather than pasted in as illustrations (doc/taste.md §12).
 * Each one stands on the same ground so a row of them reads as one strip.
 */
import { ENGRAVED_FIGURES } from "./EngravedFigures";

export const POINT_FIGURES = [
  "crowd",
  "promises",
  "message",
  "crowd-engraved",
  "promises-engraved",
  "message-engraved",
  "contacts-illustrated",
  "follow-up-illustrated",
  "app-fatigue-illustrated",
] as const;

export type PointFigureName = (typeof POINT_FIGURES)[number];

// Heap rows, bottom up: how many circles and the centre line they sit on.
const HEAP = [
  { count: 7, y: 112 },
  { count: 6, y: 99 },
  { count: 4, y: 86 },
  { count: 2, y: 73 },
];
// The ones still known by name, as [row, index].
const KNOWN = ["0-1", "1-3", "2-0"];

function Crowd() {
  return (
    <>
      {HEAP.flatMap(({ count, y }, row) =>
        Array.from({ length: count }, (_, i) => {
          const x = 96 + (i - (count - 1) / 2) * 15;
          const key = `${row}-${i}`;
          return (
            <circle
              key={key}
              className={KNOWN.includes(key) ? "pf-fill" : "pf-muted"}
              cx={x}
              cy={y}
              r={6.5}
            />
          );
        }),
      )}
      {/* still arriving */}
      <circle className="pf-faint" cx={64} cy={34} r={6.5} />
      <circle className="pf-faint" cx={112} cy={16} r={6.5} />
      <circle className="pf-faint" cx={138} cy={46} r={6.5} />
    </>
  );
}

function Promises() {
  return (
    <>
      <line className="pf-ink" x1={12} y1={52} x2={78} y2={52} />
      <line className="pf-muted pf-dash" x1={78} y1={52} x2={180} y2={52} />
      <rect className="pf-fill" x={19} y={47} width={10} height={10} />
      <rect className="pf-fill" x={55} y={47} width={10} height={10} />
      <rect className="pf-muted pf-paper" x={91} y={47} width={10} height={10} />
      <rect className="pf-faint pf-paper" x={127} y={47} width={10} height={10} />
      {/* the one that fell off */}
      <rect
        className="pf-faint"
        x={157}
        y={105}
        width={10}
        height={10}
        transform="rotate(18 162 110)"
      />
      <line className="pf-faint pf-dash" x1={168} y1={58} x2={164} y2={98} />
    </>
  );
}

function Message() {
  return (
    <>
      {/* screens to open, each one a step higher */}
      {[24, 40, 56, 72].map((h, i) => (
        <rect key={h} className="pf-muted" x={12.5 + i * 24} y={119.5 - h} width={18} height={h} />
      ))}
      {/* one message instead */}
      <path
        className="pf-fill"
        d="M124 70h48a8 8 0 0 1 8 8v20a8 8 0 0 1-8 8h-36l-10 10v-10h-2a8 8 0 0 1-8-8V78a8 8 0 0 1 8-8z"
      />
      <line className="pf-paper-ink" x1={130} y1={82} x2={168} y2={82} />
      <line className="pf-paper-ink" x1={130} y1={94} x2={154} y2={94} />
    </>
  );
}

const ILLUSTRATIONS = {
  "contacts-illustrated": "/figures/hermes/people-pen-v3.webp",
  "follow-up-illustrated": "/figures/hermes/promises-pen-v3.webp",
  "app-fatigue-illustrated": "/figures/hermes/apps-pen-v3.webp",
} as const;

type IllustratedFigureName = keyof typeof ILLUSTRATIONS;

const DRAWINGS: Record<Exclude<PointFigureName, IllustratedFigureName>, () => React.ReactNode> = {
  crowd: Crowd,
  promises: Promises,
  message: Message,
  ...ENGRAVED_FIGURES,
};

export function PointFigure({ name }: { name: PointFigureName }) {
  if (
    name === "contacts-illustrated" ||
    name === "follow-up-illustrated" ||
    name === "app-fatigue-illustrated"
  ) {
    // These assets contain only ink alpha: no light fills or raster background.
    // Paint with the theme foreground rather than inverting the source image.
    const mask = `url("${ILLUSTRATIONS[name]}")`;
    return (
      <span
        className="point-illustration"
        aria-hidden="true"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      />
    );
  }
  const Drawing = DRAWINGS[name];
  return (
    <svg className="point-figure" viewBox="0 0 192 120" aria-hidden="true">
      <Drawing />
      <line className="pf-ground" x1={0} y1={119.5} x2={192} y2={119.5} />
    </svg>
  );
}
