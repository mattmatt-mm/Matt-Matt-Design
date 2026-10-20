/**
 * The Hermes Task problem figures drawn by hand, after the JW Anderson
 * engravings Matt shared on 2026-10-19: the same ideas as Crowd, Promises
 * and Message in PointFigure.tsx, but every line is a pen stroke that wavers,
 * swells in the middle, tapers at its ends and runs heavier on the side in
 * shadow. Shapes stay open, never filled; tone comes only from hatching, with
 * light from the upper left. See doc/engraving-graphics.md.
 *
 * Each stroke is a thin filled outline rather than an SVG stroke, so its
 * width can change along its length. The wobble comes from a seeded random
 * source, so a figure draws the same way on every render.
 */

type Pt = [number, number];
type Ink = "ink" | "muted" | "faint";

type StrokeOptions = {
  /** Width at the stroke's fullest, in viewBox units. */
  w: number;
  /** How far the line wanders off its course. */
  jitter?: number;
  /** Share of the length spent tapering at each end. */
  taper?: number;
  /** Extra weight at a point: 1 is neutral, more is heavier. */
  weight?: (p: Pt) => number;
};

const FILL: Record<Ink, string> = {
  ink: "pf-fill",
  muted: "pf-fill-muted",
  faint: "pf-fill-faint",
};

const WIDTH: Record<Ink, number> = { ink: 1, muted: 0.8, faint: 0.6 };
const HATCH: Record<Ink, number> = { ink: 0.45, muted: 0.4, faint: 0.35 };

const round = (n: number) => Math.round(n * 100) / 100;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Points at an even spacing along a polyline.
function resample(points: Pt[], step: number): Pt[] {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i];
    lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[lengths.length - 1];
  const n = Math.max(2, Math.ceil(total / step) + 1);
  const out: Pt[] = [];
  let seg = 1;
  for (let i = 0; i < n; i++) {
    const at = (total * i) / (n - 1);
    while (seg < points.length - 1 && lengths[seg] < at) seg++;
    const span = lengths[seg] - lengths[seg - 1] || 1;
    const k = (at - lengths[seg - 1]) / span;
    const [ax, ay] = points[seg - 1];
    const [bx, by] = points[seg];
    out.push([ax + (bx - ax) * k, ay + (by - ay) * k]);
  }
  return out;
}

/** A pen that collects hand-drawn strokes, one path per ink. */
function createPen(seed: number) {
  const rand = seeded(seed);
  const between = (a: number, b: number) => a + (b - a) * rand();
  const paths: Record<Ink, string[]> = { ink: [], muted: [], faint: [] };

  function stroke(points: Pt[], ink: Ink, { w, jitter = 0.25, taper = 0.22, weight }: StrokeOptions) {
    const pts = resample(points, 1.2);
    const n = pts.length;
    const length = (n - 1) * 1.2;
    const phase = [between(0, 6.3), between(0, 6.3), between(0, 6.3)];
    const slow = Math.max(0.6, length / 16);
    const fast = Math.max(1.2, length / 5);
    const left: string[] = [];
    const right: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const [px, py] = pts[i];
      const [ax, ay] = pts[Math.max(0, i - 1)];
      const [bx, by] = pts[Math.min(n - 1, i + 1)];
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / len;
      const ny = (bx - ax) / len;
      const drift =
        jitter *
        (0.7 * Math.sin(6.283 * slow * t + phase[0]) + 0.3 * Math.sin(6.283 * fast * t + phase[1]));
      const end = Math.min(t, 1 - t) / taper;
      const profile = end >= 1 ? 1 : 0.15 + 0.85 * Math.sin((end * Math.PI) / 2);
      const pulse = 0.8 + 0.4 * (0.5 + 0.5 * Math.sin(6.283 * slow * 1.7 * t + phase[2]));
      const half = (w * profile * pulse * (weight ? weight([px, py]) : 1)) / 2;
      const cx = px + nx * drift;
      const cy = py + ny * drift;
      left.push(`${round(cx + nx * half)} ${round(cy + ny * half)}`);
      right.push(`${round(cx - nx * half)} ${round(cy - ny * half)}`);
    }
    paths[ink].push(`M${left.join("L")}L${right.reverse().join("L")}Z`);
  }

  /** A straight line drawn freehand: it bows a little and overshoots. */
  function line(a: Pt, b: Pt, ink: Ink, opts: Partial<StrokeOptions> & { bow?: number; overshoot?: number } = {}) {
    const { bow = between(-0.35, 0.35), overshoot = 0.8, ...rest } = opts;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const s0 = between(-0.2, overshoot);
    const s1 = between(-0.2, overshoot);
    const start: Pt = [a[0] - ux * s0, a[1] - uy * s0];
    const pts: Pt[] = [];
    const total = len + s0 + s1;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const lift = bow * 4 * t * (1 - t);
      pts.push([start[0] + ux * total * t - uy * lift, start[1] + uy * total * t + ux * lift]);
    }
    stroke(pts, ink, { w: WIDTH[ink], ...rest });
  }

  /** A run of lines through the points, each its own stroke. */
  function edges(points: Pt[], ink: Ink, opts: Partial<StrokeOptions> = {}) {
    for (let i = 1; i < points.length; i++) line(points[i - 1], points[i], ink, opts);
  }

  /** A circle in one turn of the pen, overlapping where it closes. */
  function circle(cx: number, cy: number, r: number, ink: Ink, opts: Partial<StrokeOptions> = {}) {
    const start = between(0, 6.283);
    const lobe = between(0, 6.283);
    const pts: Pt[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = start + ((6.283 + 0.35) * i) / 40;
      const rr = r * (1 + 0.025 * Math.sin(3 * a + lobe));
      pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
    }
    stroke(pts, ink, { w: WIDTH[ink], taper: 0.08, ...opts });
  }

  /** Short hatch strokes, each a little uneven in length and course. */
  function hatch(segments: [Pt, Pt][], ink: Ink, bow = 0) {
    for (const [a, b] of segments) {
      const k0 = between(0, 0.12);
      const k1 = between(0, 0.12);
      const from: Pt = [a[0] + (b[0] - a[0]) * k0, a[1] + (b[1] - a[1]) * k0];
      const to: Pt = [b[0] + (a[0] - b[0]) * k1, b[1] + (a[1] - b[1]) * k1];
      line(from, to, ink, {
        w: HATCH[ink],
        jitter: 0.12,
        taper: 0.35,
        overshoot: 0,
        bow: bow + between(-0.15, 0.15),
      });
    }
  }

  /** A dashed line laid down by hand, no two dashes alike. */
  function dashes(a: Pt, b: Pt, ink: Ink) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / len;
    const uy = (b[1] - a[1]) / len;
    for (let at = 0; at < len; ) {
      const dash = Math.min(between(2.5, 4.5), len - at);
      line([a[0] + ux * at, a[1] + uy * at], [a[0] + ux * (at + dash), a[1] + uy * (at + dash)], ink, {
        w: WIDTH[ink] * 0.8,
        overshoot: 0,
        jitter: 0.1,
      });
      at += dash + between(2.5, 4);
    }
  }

  function render() {
    return (["faint", "muted", "ink"] as const).map((ink) =>
      paths[ink].length ? <path key={ink} className={FILL[ink]} d={paths[ink].join("")} /> : null,
    );
  }

  return { rand, between, stroke, line, edges, circle, hatch, dashes, render };
}

type Pen = ReturnType<typeof createPen>;

// Heavier toward the lower right, where an outline sits in shadow.
const shade = (cx: number, cy: number, reach: number, k = 1) => ([x, y]: Pt) =>
  0.65 + k * Math.max(0, (x - cx + (y - cy)) / (reach * 1.414));

/**
 * Hatch lines at `angle` across a circle, left out where the light falls
 * (the circle `lit`). Worked with the lines running level, then turned back.
 */
function crescent(cx: number, cy: number, r: number, angle: number, gap: number, lit: [number, number, number]) {
  const a = (angle * Math.PI) / 180;
  const turn = ([x, y]: Pt, s: number): Pt => [
    x * Math.cos(s * a) - y * Math.sin(s * a),
    x * Math.sin(s * a) + y * Math.cos(s * a),
  ];
  const [ox, oy] = turn([cx, cy], -1);
  const [lx, ly] = turn([lit[0], lit[1]], -1);
  const out: [Pt, Pt][] = [];
  for (let v = oy - r + gap / 2; v < oy + r; v += gap) {
    const w = Math.sqrt(Math.max(0, r * r - (v - oy) ** 2));
    let spans: Pt[] = [[ox - w, ox + w]];
    const dl = v - ly;
    if (Math.abs(dl) < lit[2]) {
      const lw = Math.sqrt(lit[2] * lit[2] - dl * dl);
      spans = spans.flatMap(([s, e]): Pt[] => {
        const parts: Pt[] = [];
        if (lx - lw > s) parts.push([s, Math.min(e, lx - lw)]);
        if (lx + lw < e) parts.push([Math.max(s, lx + lw), e]);
        return parts;
      });
    }
    for (const [s, e] of spans) {
      if (e - s > 1) out.push([turn([s, v], 1), turn([e, v], 1)]);
    }
  }
  return out;
}

function sphere(pen: Pen, cx: number, cy: number, r: number, ink: Ink) {
  pen.circle(cx, cy, r, ink, { weight: shade(cx, cy, r, ink === "faint" ? 0.3 : 0.9) });
  if (ink === "faint") return;
  const dense = ink === "ink";
  // The shadow side, hatched along the form, the lit cap left bare.
  const lit = dense ? 0.74 : 0.84;
  pen.hatch(crescent(cx, cy, r - 0.7, 45, dense ? 1.35 : 1.9, [cx - 0.36 * r, cy - 0.36 * r, lit * r]), ink, 0.6);
  if (dense) {
    pen.hatch(crescent(cx, cy, r - 0.7, -45, 1.6, [cx - 0.26 * r, cy - 0.26 * r, 0.9 * r]), ink, -0.4);
  }
}

const HEAP = [
  { count: 5, y: 110 },
  { count: 4, y: 94.4 },
  { count: 3, y: 78.8 },
  { count: 2, y: 63.2 },
];
// The ones still known by name, as [row, index].
const KNOWN = ["0-1", "1-3", "2-0"];

function Crowd() {
  const pen = createPen(11);
  HEAP.forEach(({ count, y }, row) => {
    for (let i = 0; i < count; i++) {
      const cx = 96 + (i - (count - 1) / 2) * 18;
      sphere(pen, cx, y, 9, KNOWN.includes(`${row}-${i}`) ? "ink" : "muted");
    }
  });
  // the heap's shadow, falling right along the ground
  [118.2, 116.4, 114.6].forEach((y, i) => pen.line([142, y], [142 + 20 - i * 7, y], "muted", { w: HATCH.muted }));
  // still arriving, each with a stroke of its fall
  for (const [cx, cy] of [[58, 32], [110, 14], [142, 42]] as Pt[]) {
    sphere(pen, cx, cy, 9, "faint");
    pen.line([cx - 3, cy - 13], [cx - 3, cy - 17], "faint", { w: HATCH.faint, overshoot: 0 });
    pen.line([cx + 2, cy - 12.5], [cx + 2, cy - 19], "faint", { w: HATCH.faint, overshoot: 0 });
  }
  return <>{pen.render()}</>;
}

/** A cube seen front on, its top lit, its right side in shade. */
function cube(pen: Pen, x: number, y: number, ink: Ink, turn?: { cx: number; cy: number; deg: number }) {
  const s = 13;
  const d = 5;
  const a = ((turn?.deg ?? 0) * Math.PI) / 180;
  const at = (px: number, py: number): Pt => {
    if (!turn) return [px, py];
    const dx = px - turn.cx;
    const dy = py - turn.cy;
    return [turn.cx + dx * Math.cos(a) - dy * Math.sin(a), turn.cy + dx * Math.sin(a) + dy * Math.cos(a)];
  };
  const f0 = at(x, y);
  const f1 = at(x + s, y);
  const f2 = at(x + s, y + s);
  const f3 = at(x, y + s);
  const t0 = at(x + d, y - d);
  const t1 = at(x + s + d, y - d);
  const b1 = at(x + s + d, y + s - d);
  const heavy = { w: WIDTH[ink] * 1.35 };
  pen.edges([f3, f0, f1], ink);
  pen.edges([f1, f2, f3], ink, heavy);
  pen.edges([f0, t0, t1, f1], ink);
  pen.edges([t1, b1, f2], ink, heavy);
  if (ink === "faint") return;
  const gap = ink === "ink" ? 1.1 : 1.7;
  const side: [Pt, Pt][] = [];
  for (let u = gap * 0.6; u < d - 0.3; u += gap) side.push([at(x + s + u, y - u + 0.8), at(x + s + u, y + s - u - 0.8)]);
  pen.hatch(side, ink);
  // the front falls into shade toward its lower right corner
  const front: [Pt, Pt][] = [];
  for (let c = s * 0.2; c < s - 1.2; c += ink === "ink" ? 1.5 : 2.4) {
    front.push([at(x + c + 0.4, y + s - 0.6), at(x + s - 0.6, y + c + 0.4)]);
  }
  pen.hatch(front, ink);
}

function Promises() {
  const pen = createPen(23);
  // the plank that holds what we have kept, broken off short
  pen.line([10, 66], [95, 66], "ink");
  pen.line([10, 72], [93.5, 72], "ink", { w: WIDTH.ink * 1.4 });
  pen.line([10, 66], [10, 72], "ink", { overshoot: 0.3 });
  pen.stroke([[95, 65.6], [92, 68], [96, 69.6], [93.5, 72.3]], "ink", { w: WIDTH.ink, jitter: 0.1 });
  pen.line([13, 68.6], [62, 68.4], "ink", { w: HATCH.ink, overshoot: 0 });
  pen.line([28, 70.2], [88, 70.4], "ink", { w: HATCH.ink, overshoot: 0 });
  cube(pen, 18, 53, "ink");
  cube(pen, 44, 53, "ink");
  cube(pen, 72, 53, "muted");
  // what we said would follow
  pen.dashes([102, 66], [184, 66], "muted");
  cube(pen, 116, 53, "faint");
  // the one that fell off
  pen.dashes([150, 72], [154, 96], "faint");
  cube(pen, 150.5, 104.8, "muted", { cx: 157, cy: 110, deg: 18 });
  [118.2, 116.4].forEach((y, i) => pen.line([166, y], [176 - i * 4, y], "muted", { w: HATCH.muted }));
  return <>{pen.render()}</>;
}

/** One more screen to open: a monitor showing a dashboard, gone muted. */
function dashboard(pen: Pen) {
  const [x, y, w, h, d] = [8, 34, 96, 62, 4];
  const r = x + w;
  const b = y + h;
  const heavy = { w: WIDTH.muted * 1.35 };
  // the case
  pen.edges([[x, b], [x, y], [r, y]], "muted");
  pen.edges([[r, y], [r, b], [x, b]], "muted", heavy);
  pen.edges([[x, y], [x + d, y - d], [r + d, y - d], [r, y]], "muted");
  pen.edges([[r + d, y - d], [r + d, b - d], [r, b]], "muted", heavy);
  const side: [Pt, Pt][] = [];
  for (let u = 1; u < d - 0.3; u += 1.4) side.push([[r + u, y - u + 1], [r + u, b - u - 1]]);
  pen.hatch(side, "muted");
  // the glass, and the shade under its lower edge
  pen.edges([[x + 4, y + 4], [r - 4, y + 4], [r - 4, b - 4], [x + 4, b - 4], [x + 4, y + 4]], "muted", {
    w: HATCH.muted * 1.4,
  });
  const lip: [Pt, Pt][] = [];
  for (let u = x + 6; u < r - 2; u += 2.2) lip.push([[u, b - 3.4], [u + 1.4, b - 0.8]]);
  pen.hatch(lip, "muted");
  // the dashboard: a sidebar, a header, three figure cards, rows nobody reads
  const [sx, sy, sr, sb] = [x + 4, y + 4, r - 4, b - 4];
  pen.line([sx + 14, sy + 1], [sx + 14, sb - 1], "faint", { overshoot: 0 });
  pen.line([sx + 15, sy + 8], [sr - 1, sy + 8], "faint", { overshoot: 0 });
  for (let i = 0; i < 3; i++) {
    const cx = sx + 18 + i * 22;
    pen.edges([[cx, sy + 12], [cx + 18, sy + 12], [cx + 18, sy + 24], [cx, sy + 24], [cx, sy + 12]], "faint", {
      w: WIDTH.faint * 0.8,
    });
    pen.line([cx + 3, sy + 19], [cx + 11, sy + 19], "muted", { w: HATCH.muted * 1.4, overshoot: 0 });
  }
  for (const ry of [30, 35, 40, 45]) pen.line([sx + 18, sy + ry], [sr - 4, sy + ry], "faint", { overshoot: 0 });
  for (const iy of [5, 10, 15, 20]) pen.line([sx + 3, sy + iy], [sx + 10, sy + iy], "muted", { w: HATCH.muted * 1.4, overshoot: 0 });
  pen.line([sx + 18, sy + 4], [sx + 34, sy + 4], "muted", { w: HATCH.muted * 1.4, overshoot: 0 });
  // the stand, and its shadow on the ground
  pen.line([52, b], [52, 110], "muted", { overshoot: 0.2 });
  pen.line([60, b], [60, 110], "muted", { ...heavy, overshoot: 0.2 });
  pen.hatch([[[57.5, b + 1], [57.5, 109]], [[58.8, b + 1], [58.8, 109]]], "muted");
  pen.edges([[40, 119.3], [44, 110], [68, 110], [72, 119.3]], "muted");
  [118.2, 116.4].forEach((yy, i) => pen.line([73, yy], [82 - i * 4, yy], "muted", { w: HATCH.muted }));
}

// The speech bubble's outline, clockwise from the top left, tail and all.
function bubbleOutline(): Pt[] {
  const arc = (cx: number, cy: number, from: number, to: number): Pt[] =>
    Array.from({ length: 6 }, (_, i) => {
      const a = ((from + ((to - from) * i) / 5) * Math.PI) / 180;
      return [cx + 8 * Math.cos(a), cy + 8 * Math.sin(a)];
    });
  return [
    [124, 70],
    ...arc(172, 78, -90, 0),
    ...arc(172, 98, 0, 90),
    [137, 106],
    [126.5, 116],
    [127, 106],
    ...arc(124, 98, 90, 180),
    ...arc(124, 78, 180, 270),
    [128, 70],
  ];
}

function Message() {
  const pen = createPen(37);
  dashboard(pen);
  // one message instead: drawn in ink, open, shaded only along its lower right
  pen.stroke(bubbleOutline(), "ink", { w: 1.1, taper: 0.04, jitter: 0.3, weight: shade(148, 88, 30, 1.1) });
  const inside: [Pt, Pt][] = [];
  for (let x = 123; x < 175; x += 1.7) inside.push([[x, 104.6], [x - 3.4, 104.6 - pen.between(2.4, 4.4)]]);
  for (let y = 79; y < 99; y += 1.7) inside.push([[178.6, y], [178.6 - pen.between(2.4, 4.4), y - 3.4]]);
  pen.hatch(inside, "ink");
  pen.line([128, 82], [168, 82], "ink", { w: 1.2 });
  pen.line([128, 93], [152, 93], "ink", { w: 1.2 });
  // it hangs above the ground, so its shadow lies apart from it
  [118.2, 116.4].forEach((y, i) => pen.line([138 + i * 4, y], [172 - i * 6, y], "muted", { w: HATCH.muted }));
  return <>{pen.render()}</>;
}

export const ENGRAVED_FIGURES = {
  "crowd-engraved": Crowd,
  "promises-engraved": Promises,
  "message-engraved": Message,
};
