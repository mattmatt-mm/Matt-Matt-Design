import { clamp01, cubicBezier, fade, lerp, move, span } from "./easing";

/**
 * The ISD dot story, revision 3 (doc/isd-dot-hero-plan.md), as a pure
 * function of time: `drawScene(ctx, scene, t, …)` paints the frame at `t`
 * real seconds, so the hero can play it and the review page can scrub it.
 *
 * The story runs on its own clock. Real time maps onto story time through a
 * speed curve that dips into slow motion twice: when the two ripples meet,
 * and as the sprint turns into the logo. Everything, the camera included,
 * slows with it.
 *
 * Every dot on screen is born from the first one. Nothing holds still, the
 * camera follows one continuous path that only ever turns clockwise, and
 * beats overlap so speed carries across every seam.
 *
 * World units: the finished logo has radius 1; at camera zoom 1 that radius
 * fills 45% of the frame's height.
 */

/** The logo, packed by scripts/pack-isd-hero.py into public/isd/hero.json. */
export type LogoData = {
  /** Every dot of the logo, bands included: [x, y, r, wedge]. */
  lattice: [number, number, number, number][];
  /** Each wedge's outline; the lattice is clipped to it. */
  masks: [number, number][][];
};

type RoomMap = { cols: number; rows: number; map: number[] };
export type RoomsData = Record<"world" | "unite" | "action", RoomMap>;

const rad = (deg: number) => (deg * Math.PI) / 180;
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// ─── Story time ─────────────────────────────────────────────────────────────

/** The story ends as the camera finishes diving into the logo's triangle. */
const STORY_END = 19.65;

/** Slow motion, in story seconds: the ripples meeting, and the last strides
 * of the sprint as the ripple into the logo leaves the runner. */
const SLOW = [
  { from: 9.05, to: 9.75, rate: 0.33, ramp: 0.35 },
  { from: 14.6, to: 15.7, rate: 0.3, ramp: 0.9 },
];

function storyRate(s: number) {
  let rate = 1;
  for (const w of SLOW) {
    const inside = smoothstep(w.from - w.ramp, w.from, s) * (1 - smoothstep(w.to, w.to + 0.35, s));
    rate -= (1 - w.rate) * inside;
  }
  return rate;
}

/** Real time → story time, integrated once at load. */
const CLOCK_STEP = 1 / 240;
const CLOCK = (() => {
  const out = [0];
  let s = 0;
  while (s < STORY_END) {
    s += storyRate(s) * CLOCK_STEP;
    out.push(Math.min(s, STORY_END));
  }
  return Float32Array.from(out);
})();

/** The loop's length in real seconds, slow motion included. */
export const DURATION = (CLOCK.length - 1) * CLOCK_STEP;

function storyAt(real: number) {
  const f = real / CLOCK_STEP;
  const i = Math.min(CLOCK.length - 2, Math.floor(f));
  return lerp(CLOCK[i], CLOCK[i + 1], f - i);
}

function realAt(story: number) {
  let lo = 0;
  let hi = CLOCK.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (CLOCK[mid] < story) lo = mid;
    else hi = mid;
  }
  return hi * CLOCK_STEP;
}

/** Where each beat starts, in real seconds, for the review page. */
export const BEATS = [
  { name: "From nothing", start: 0 },
  { name: "Division", start: 1.0 },
  { name: "Diverse", start: 4.5 },
  { name: "Connect", start: 8.0 },
  { name: "Unite", start: 11.0 },
  { name: "Action", start: 13.5 },
  { name: "Slow motion", start: 13.9 },
  { name: "Logo", start: 15.3 },
  { name: "Radiate", start: 18.45 },
].map((b) => ({ name: b.name, start: realAt(b.start) }));

/** The finished logo, for reduced motion. */
export const LOGO_FRAME = realAt(17.85);

// ─── Matrix ─────────────────────────────────────────────────────────────────

const FRAME_FILL = 0.45;
const SPACING = 0.1;
/** The matrix is a disc, so it spreads with a round edge. */
const FIELD_CELLS = 37;
const FIELD_R = FIELD_CELLS * SPACING;
const BASE_R = 0.007;
const FIRST_R = 0.12;
/** The first dot's size when the loop starts, carried in from the end. */
const SEED_R = FIRST_R * 0.35;
/** Room artworks are laid on the matrix at this many world units a cell. */
const ROOM_CELL = 0.09;
/** The contoured world map (2° a cell) is wider than the frame and pans. */
const WORLD_CELL = 0.028;

// ─── One continuous camera ──────────────────────────────────────────────────

/**
 * Monotone cubic (Fritsch–Carlson) through keyframes: smooth, and it never
 * overshoots a keyframe, so a camera that is turning keeps turning the same
 * way and a pull-back never bounces.
 */
function monotone(xs: number[], ys: number[]) {
  const n = xs.length;
  const d = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
  const m = ys.map((_, i) =>
    i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2,
  );
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const h = a * a + b * b;
    if (h > 9) {
      const s = 3 / Math.sqrt(h);
      m[i] = s * a * d[i];
      m[i + 1] = s * b * d[i];
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0;
    while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

// The turn reaches 90° for the sprint, where the matrix reads level again,
// and holds there while the camera keeps pulling back; it turns on again
// with the ripple into the logo. Zoom runs on a log scale so equal steps feel equal; the
// last key is the dive into the logo's empty triangle.
const CAMERA_T = [0, 5, 8.5, 11.5, 13.5, 14.4, 15.3, 17.75, 18.45, STORY_END];
const zoomAt = monotone(CAMERA_T, [4.5, 0.95, 0.86, 0.92, 0.86, 0.86, 0.86, 1.0, 1.05, 40].map(Math.log));
const turnAt = monotone(CAMERA_T, [0, 12, 22, 40, 70, 90, 92, 130, 134, 150].map(rad));

function camera(s: number) {
  return { zoom: Math.exp(zoomAt(s)), turn: turnAt(s) };
}

/** The logo is laid in the world so it reads upright at this moment. */
const LOGO_UPRIGHT_AT = 17.75;

// ─── The sprint ─────────────────────────────────────────────────────────────

/** The matrix streams backwards under the runners, gently. */
function streamSpeed(s: number) {
  return 0.35 * span(s, 13.5, 1.0) * (1 - 0.7 * span(s, 14.4, 1.2));
}

const STREAM_STEP = 1 / 120;
const STREAM_TABLE = (() => {
  const out = new Float32Array(Math.ceil(STORY_END / STREAM_STEP) + 2);
  for (let i = 1; i < out.length; i++) out[i] = out[i - 1] + streamSpeed(i * STREAM_STEP) * STREAM_STEP;
  return out;
})();
const streamed = (s: number) =>
  STREAM_TABLE[Math.min(STREAM_TABLE.length - 1, Math.max(0, Math.round(s / STREAM_STEP)))];

/** Dots streaming off one edge come back on the other, out of sight. */
const FIELD_W = 2 * FIELD_R + SPACING;
const wrapX = (x: number) => x - FIELD_W * Math.round(x / FIELD_W);


// ─── Rooms ──────────────────────────────────────────────────────────────────

function sampler(room: RoomMap, keep?: (c: number, r: number) => boolean) {
  const map = Float32Array.from(room.map, (v, i) =>
    keep && !keep(i % room.cols, Math.floor(i / room.cols)) ? 0 : v,
  );
  const { cols, rows } = room;
  /** Bilinear sample at (u, v) in cells, origin at the artwork's centre. */
  return (u: number, v: number) => {
    const x = u + (cols - 1) / 2;
    const y = v + (rows - 1) / 2;
    if (x < 0 || y < 0 || x > cols - 1 || y > rows - 1) return 0;
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(cols - 1, x0 + 1);
    const y1 = Math.min(rows - 1, y0 + 1);
    const fx = x - x0;
    const fy = y - y0;
    const a = map[y0 * cols + x0] * (1 - fx) + map[y0 * cols + x1] * fx;
    const b = map[y1 * cols + x0] * (1 - fx) + map[y1 * cols + x1] * fx;
    return a * (1 - fy) + b * fy;
  };
}

function segDist(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = clamp01(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy));
  return Math.hypot(px - ax - dx * t, py - ay - dy * t);
}

const LABELS = [
  { text: "/diverse", from: 4.8, to: 8.5 },
  { text: "/connect", from: 8.5, to: 11.0 },
  { text: "/unite", from: 11.2, to: 13.8 },
  { text: "/action", from: 13.9, to: 15.1 },
] as const;

// Connect: one ripple from each side, passing through each other.
const SOURCE_A: [number, number] = [-1.25, 0.32];
const SOURCE_B: [number, number] = [1.25, -0.32];
const RIPPLE_FROM = 8.0;
const RIPPLE_SPEED = 0.95;

// Action: the runner's limbs, in artwork cells from the artwork's centre.
const HIP: [number, number] = [0.5, 0.5];
const THIGH = 4.3;
const SHIN = 4.6;
const SHOULDER: [number, number] = [1.0, -6.5];
const UPPER_ARM = 3.0;
const FOREARM = 2.8;

// The ending: in the slow-motion strides one ripple spreads from the
// runner's body, and each dot turns into the logo as the ripple reaches it.
const LOGO_START = 15.3;
const MORPH_SPEED = 1.3;
const LOGO_TRAVEL = 1.4;
const RADIATE = 18.45;
/** The next first dot appears in the triangle as the camera dives in. */
const RESEED = 18.85;

/** A stride that starts at running pace and eases off, never stopping dead. */
const STRIDE_EASE = cubicBezier(0.3, 0.55, 0.6, 1);

export type Scene = {
  n: number;
  gx: Float32Array;
  gy: Float32Array;
  dist: Float32Array;
  born: Float32Array;
  /** A matrix index, or `n + bead` for a dot budded from a bead. */
  parent: Int32Array;
  hidden: Uint8Array;
  beadCell: number[];
  order: Int32Array;
  logoOf: Int32Array;
  lx: Float32Array;
  ly: Float32Array;
  lr: Float32Array;
  ld: Float32Array;
  /** When the ending's ripple reaches each matrix dot. */
  morphAt: Float32Array;
  world: (u: number, v: number) => number;
  unite: (u: number, v: number) => number;
  body: (u: number, v: number) => number;
  /** Which wedge each logo dot belongs to. */
  lw: Uint8Array;
  /** Each wedge's outline, in world space, for clipping. */
  masks: Path2D[];
};

/** A deterministic hash for per-dot variety. */
const hash = (i: number) => {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// ─── Beat 1: the first dot buds, then seeds the matrix ───────────────────────

type Bead = { parent: number; born: number; angle: number; dist: number; r: number };

/** Each bud leaves its parent over SPLIT seconds, on the move curve. */
const SPLIT = 0.9;
const BEADS: Bead[] = [
  { parent: -1, born: 0, angle: 0, dist: 0, r: 0.085 },
  { parent: 0, born: 1.2, angle: 200, dist: 0.26, r: 0.07 },
  { parent: 0, born: 1.8, angle: 20, dist: 0.3, r: 0.055 },
  { parent: 1, born: 2.3, angle: 140, dist: 0.22, r: 0.045 },
  { parent: 2, born: 2.5, angle: 70, dist: 0.2, r: 0.04 },
  { parent: 0, born: 2.7, angle: 300, dist: 0.28, r: 0.05 },
  { parent: 2, born: 3.0, angle: 330, dist: 0.18, r: 0.03 },
];

function beadAt(i: number, s: number): [number, number, number] {
  const b = BEADS[i];
  if (b.parent < 0) {
    return [0, 0, lerp(SEED_R, FIRST_R, span(s, 0, 0.8)) - (FIRST_R - b.r) * span(s, 1.2, 2.0)];
  }
  const [px, py] = beadAt(b.parent, s);
  const p = span(s, b.born, SPLIT);
  const a = rad(b.angle);
  return [px + Math.cos(a) * b.dist * p, py + Math.sin(a) * b.dist * p, lerp(b.r * 0.5, b.r, p)];
}

/** The beads have settled here when the matrix starts budding from them. */
const BEADS_SETTLED = 3.9;
/** The beads shrink back to matrix size as the spread begins… */
const BEADS_SHRINK = 3.0;
/** …and slide onto their matrix cells between these times. */
const HANDOFF = 3.6;
const HANDOFF_END = 4.2;
/** How long a newborn dot takes to travel out of its parent. */
const TRAVEL = 0.7;

/**
 * Where a fully grown matrix dot sits at story time `s`, before the logo.
 * The sprint streams the matrix to the left of the screen; with the camera
 * turned 90° for the sprint, screen-left is world +y.
 */
function fieldPos(gx: number, gy: number, s: number): [number, number] {
  return [gx, wrapX(gy + streamed(s))];
}

export function buildScene(logo: LogoData, rooms: RoomsData): Scene {
  // A disc of dots, row by row.
  const cells: [number, number][] = [];
  const index = new Map<string, number>();
  for (let r = -FIELD_CELLS; r <= FIELD_CELLS; r++) {
    for (let c = -FIELD_CELLS; c <= FIELD_CELLS; c++) {
      if (Math.hypot(c, r) > FIELD_CELLS) continue;
      index.set(`${c},${r}`, cells.length);
      cells.push([c, r]);
    }
  }
  const n = cells.length;
  const gx = Float32Array.from(cells, ([c]) => c * SPACING);
  const gy = Float32Array.from(cells, ([, r]) => r * SPACING);
  const dist = Float32Array.from(cells, ([c, r]) => Math.hypot(c, r) * SPACING);
  const born = new Float32Array(n);
  const parent = new Int32Array(n).fill(-1);

  // Every matrix dot traces back to a bead, and every bead to the first dot.
  const beadEnd = BEADS.map((_, b) => beadAt(b, BEADS_SETTLED));
  const fromBead = new Float32Array(n);
  const nearestBead = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    let best = Infinity;
    beadEnd.forEach(([bx, by], b) => {
      const d = Math.hypot(gx[i] - bx, gy[i] - by);
      if (d < best) {
        best = d;
        nearestBead[i] = b;
      }
    });
    fromBead[i] = best;
  }

  // Each bead hands itself over to the matrix cell nearest it.
  const hidden = new Uint8Array(n);
  const beadCell = beadEnd.map(([bx, by], b) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (hidden[i]) continue;
      const d = (gx[i] - bx) ** 2 + (gy[i] - by) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    hidden[best] = 1;
    parent[best] = n + b;
    born[best] = HANDOFF_END - TRAVEL;
    return best;
  });

  // The rest bud outward from the beads. Birth is timed by straight-line
  // distance from the first dot, so the spreading edge stays a circle; each
  // dot travels out of its neighbour one step nearer the centre, or out of
  // a bead when it is close to one.
  const order = Int32Array.from([...Array(n).keys()].sort((a, b) => dist[a] - dist[b]));
  const bornOf = (p: number) => (p >= n ? BEADS[p - n].born + SPLIT : born[p]);
  for (const i of order) {
    if (hidden[i]) continue;
    const [c, r] = cells[i];
    if (fromBead[i] < 0.16) {
      parent[i] = n + nearestBead[i];
    } else {
      let best = -1;
      let bestD = dist[i];
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const j = index.get(`${c + dc},${r + dr}`);
        if (j !== undefined && dist[j] < bestD - 1e-6) {
          bestD = dist[j];
          best = j;
        }
      }
      parent[i] = best >= 0 ? best : n + nearestBead[i];
    }
    born[i] = Math.max(
      3.0 + 1.25 * Math.sqrt(Math.max(0, dist[i] - 0.3)) + (hash(i) - 0.5) * 0.06,
      bornOf(parent[i]) + 0.02,
    );
  }

  // The logo, laid so it reads upright when the camera reaches it.
  const upright = camera(LOGO_UPRIGHT_AT).turn;
  const cos = Math.cos(-upright);
  const sin = Math.sin(-upright);
  const m = logo.lattice.length;
  const lx = new Float32Array(m);
  const ly = new Float32Array(m);
  const lr = new Float32Array(m);
  const ld = new Float32Array(m);
  const lw = new Uint8Array(m);
  logo.lattice.forEach(([x, y, r, wedge], j) => {
    lw[j] = wedge;
    lx[j] = x * cos - y * sin;
    ly[j] = x * sin + y * cos;
    lr[j] = r;
    ld[j] = Math.min(1, Math.hypot(x, y));
  });

  // Each logo dot is made by the nearest dot of the gathered matrix at the
  // moment the logo starts to form, largest logo dots first.
  const logoOf = new Int32Array(n).fill(-1);
  const at = Array.from(gx, (x, i) => fieldPos(x, gy[i], LOGO_START));
  const logoOrder = [...Array(m).keys()].sort((a, b) => lr[b] - lr[a]);
  for (const j of logoOrder) {
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < n; i++) {
      if (logoOf[i] >= 0) continue;
      const d = (at[i][0] - lx[j]) ** 2 + (at[i][1] - ly[j]) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    logoOf[best] = j;
  }

  const morphAt = Float32Array.from(at, ([x, y]) => LOGO_START + Math.hypot(x, y) / MORPH_SPEED);

  const masks = logo.masks.map((corners) => {
    const path = new Path2D();
    corners.forEach(([x, y], k) => {
      const wx = x * cos - y * sin;
      const wy = x * sin + y * cos;
      if (k === 0) path.moveTo(wx, wy);
      else path.lineTo(wx, wy);
    });
    path.closePath();
    return path;
  });

  // The runner's head and torso from the artwork; arms and legs are drawn
  // every frame from the running cycle.
  const body = sampler(rooms.action, (c, r) => c >= 10 && c <= 16 && r <= 13);

  return {
    n,
    gx,
    gy,
    dist,
    born,
    parent,
    hidden,
    beadCell,
    order,
    logoOf,
    lx,
    ly,
    lr,
    ld,
    morphAt,
    world: sampler(rooms.world),
    unite: sampler(rooms.unite),
    body,
    lw,
    masks,
  };
}

// ─── The runner ─────────────────────────────────────────────────────────────

type Pose = { phase: number };

/** A two-segment limb from `root`, angles measured from straight down. */
function limb(
  u: number,
  v: number,
  root: [number, number],
  a1: number,
  len1: number,
  a2: number,
  len2: number,
) {
  const jx = root[0] + Math.sin(a1) * len1;
  const jy = root[1] + Math.cos(a1) * len1;
  const ex = jx + Math.sin(a2) * len2;
  const ey = jy + Math.cos(a2) * len2;
  return Math.min(segDist(u, v, root[0], root[1], jx, jy), segDist(u, v, jx, jy, ex, ey));
}

/** Arms and legs at stride `phase`. */
function limbs(u: number, v: number, { phase }: Pose) {
  let best = Infinity;
  [phase, phase + Math.PI].forEach((p, side) => {
    // Legs: the thigh swings about a slight forward lean; the knee folds
    // most as the leg swings through.
    const runThigh = rad(10) + rad(42) * Math.sin(p);
    const runShin = runThigh - rad(18) - rad(62) * (0.5 + 0.5 * Math.sin(p + Math.PI / 2));
    best = Math.min(
      best,
      limb(u, v, HIP, runThigh, THIGH, runShin, SHIN),
    );
    // Arms swing against the legs, elbows bent.
    const runUpper = rad(-8) - rad(48) * Math.sin(p);
    const runFore = runUpper + rad(75);
    best = Math.min(
      best,
      limb(u, v, SHOULDER, runUpper, UPPER_ARM, runFore, FOREARM),
    );
  });
  return 0.85 * (1 - smoothstep(0.25, 0.75, best));
}

/** A runner at (u, v) cells, bobbing with the stride. */
function runner(s: Scene, u: number, v: number, pose: Pose) {
  // Most dots are nowhere near a runner: skip the limb maths for them.
  if (u < -11 || u > 13 || v < -16 || v > 12) return 0;
  const bob = -0.3 * Math.abs(Math.sin(pose.phase));
  return Math.max(s.body(u, v - bob), limbs(u, v - bob, pose));
}

/**
 * How large a dot at screen-aligned world position (x, y) should be from the
 * room beats. Rooms are sampled in screen orientation, so they stay upright
 * while the matrix turns beneath them.
 */
function roomRadius(s: Scene, x: number, y: number, t: number, front: number) {
  let r = 0;

  // Diverse: the continents swell in behind the division front and dissolve
  // as the ripples pass; the ocean never stops moving.
  const dIn = span(t, 4.5 + front, 1.2);
  const da = Math.hypot(x - SOURCE_A[0], y - SOURCE_A[1]);
  const db = Math.hypot(x - SOURCE_B[0], y - SOURCE_B[1]);
  const dOut = span(t, RIPPLE_FROM + 0.2 + Math.min(da, db) / RIPPLE_SPEED, 0.8);
  const diverseW = dIn * (1 - dOut);
  if (diverseW > 0) {
    // The view drifts east across the map: from the Americas and Africa
    // towards Asia, so the continents keep moving under the matrix.
    const pan = lerp(-30, 30, clamp01((t - 4.5) / 4.5)) / 2;
    const land = s.world(x / WORLD_CELL + pan, y / WORLD_CELL - 4);
    const swell =
      0.5 +
      0.5 *
        (0.5 * Math.sin(x * 5.1 + y * 2.3 - t * 1.7) +
          0.3 * Math.sin(-x * 3.7 + y * 6.2 - t * 2.3 + 1.3) +
          0.2 * Math.sin(x * 9.4 - y * 4.1 - t * 3.1 + 4.1));
    const ocean = 1 - smoothstep(0.05, 0.3, land);
    r += diverseW * (land * 0.038 + ocean * swell * 0.012);
  }

  // Connect: one ripple from each side. They pass through each other, and
  // where the two crests overlap they add up.
  const cIn = span(t, RIPPLE_FROM, 0.4, fade);
  const cOut = span(t, 11.0, 1.4);
  if (t > RIPPLE_FROM && cIn * (1 - cOut) > 0) {
    const age = t - RIPPLE_FROM;
    const ring = age * RIPPLE_SPEED;
    const fall = Math.exp(-age * 0.25);
    const a = Math.exp(-(((da - ring) / 0.11) ** 2)) * fall;
    const b = Math.exp(-(((db - ring) / 0.11) ** 2)) * fall;
    const meet = Math.min(1, a * b * 3);
    r += cIn * (1 - cOut) * (Math.min(1, a + b) * 0.016 + meet * 0.006);
  }

  // Unite: gathered inward into the team ring, which keeps circling.
  const uIn = span(t, 11.0, 1.5);
  const uOut = span(t, 13.6, 1.0);
  if (uIn * (1 - uOut) > 0) {
    const gather = lerp(2.0, 1.0, uIn) * lerp(1, 1.35, uOut);
    const spin = (t - 11.0) * rad(28);
    const c = Math.cos(-spin);
    const sn = Math.sin(-spin);
    const ux = (x * c - y * sn) / gather - uOut * 0.6;
    const uy = (x * sn + y * c) / gather;
    r += uIn * (1 - uOut) * s.unite(ux / ROOM_CELL, uy / ROOM_CELL) * 0.04;
  }

  // Action: the team sprints, and dissolves as the ripple leaves the runner.
  const aIn = span(t, 13.6, 1.2);
  const aOut = span(t, LOGO_START + Math.hypot(x, y) / MORPH_SPEED - 0.15, 0.4);
  if (aIn * (1 - aOut) > 0) {
    const enter = lerp(-0.8, 0, aIn);
    const u = (x - enter) / ROOM_CELL;
    const v = y / ROOM_CELL;
    // One stride that lasts until the ripple takes over, easing off as the
    // story clock slows into slow motion, so the runner never stands still.
    const phase = Math.PI * 2 * span(t, 13.6, 2.3, STRIDE_EASE);
    const main = runner(s, u, v, { phase });
    const mates =
      0.45 *
      Math.max(
        runner(s, u + 8, v - 0.6, { phase: phase - 1.6 }),
        runner(s, u - 8, v + 0.4, { phase: phase - 3.2 }),
      );
    r += aIn * (1 - aOut) * Math.max(main, mates) * 0.046;
  }

  // The ending's ripple, spreading from the runner's body.
  if (t > LOGO_START && t < LOGO_START + 2.2) {
    const ring = (t - LOGO_START) * MORPH_SPEED;
    r += 0.02 * Math.exp(-(((Math.hypot(x, y) - ring) / 0.12) ** 2)) * (1 - span(t, LOGO_START + 1.0, 1.2));
  }

  return r;
}

export type Palette = { dot: string; ground: string; font: string };

export function drawScene(
  ctx: CanvasRenderingContext2D,
  s: Scene,
  time: number,
  width: number,
  height: number,
  dpr: number,
  palette: Palette,
) {
  const real = ((time % DURATION) + DURATION) % DURATION;
  const t = storyAt(real);
  const { zoom, turn } = camera(t);
  const unit = height * FRAME_FILL * zoom;
  const cosT = Math.cos(turn);
  const sinT = Math.sin(turn);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = palette.ground;
  ctx.fillRect(0, 0, width, height);
  ctx.translate(width / 2, height / 2);
  ctx.scale(unit, unit);
  ctx.rotate(turn);
  ctx.fillStyle = palette.dot;

  const view = Math.hypot(width, height) / 2 / unit + 0.1;
  const minR = 0.25 / unit;
  const dots = new Path2D();
  const bridges: Path2D[] = [];
  /** Logo dots that have landed, per wedge, drawn through the wedge's mask. */
  const wedges = [new Path2D(), new Path2D(), new Path2D()];
  // Radiate: the whole logo pushes out from the centre together, so its
  // masks can push out with it, trembling as it goes.
  const out = 1 + 1.3 * span(t, RADIATE, 1.1);
  const shake = 0.009 * span(t, RADIATE, 0.3, fade);

  // The beads: the first dot budding with goo, then each bead handing
  // itself over to its matrix cell.
  const beads = BEADS.map((_, b) => beadAt(b, t));
  if (t < HANDOFF_END) {
    const hand = span(t, HANDOFF, HANDOFF_END - HANDOFF);
    const shrink = span(t, BEADS_SHRINK, 1.2);
    const goo = new Path2D();
    BEADS.forEach((b, k) => {
      if (t < b.born) return;
      let [x, y, r] = beads[k];
      r = lerp(r, BASE_R, shrink);
      if (hand > 0) {
        const cell = s.beadCell[k];
        x = lerp(x, s.gx[cell], hand);
        y = lerp(y, s.gy[cell], hand);
      }
      if (r <= 0) return;
      goo.moveTo(x + r, y);
      goo.arc(x, y, r, 0, Math.PI * 2);
      if (b.parent >= 0 && hand === 0) {
        const [qx, qy, qr] = beads[b.parent];
        const bridge = new Path2D();
        metaballBridge(bridge, qx, qy, qr, x, y, r);
        bridges.push(bridge);
      }
    });
    ctx.fill(goo);
  }

  // Where each matrix dot is now, for its children.
  const px = new Float32Array(s.n);
  const py = new Float32Array(s.n);

  // Visited nearest-the-beads first, so a parent is placed before its child.
  for (const i of s.order) {
    if (t < s.born[i]) continue;
    let x: number;
    let y: number;

    // Division: travel out of the parent, growing to matrix size, with a
    // ripple that runs along the spreading edge.
    const age = t - s.born[i];
    const p = s.parent[i];
    const go = move(clamp01(age / TRAVEL));
    if (go < 1) {
      x = lerp(p >= s.n ? beads[p - s.n][0] : px[p], s.gx[i], go);
      y = lerp(p >= s.n ? beads[p - s.n][1] : py[p], s.gy[i], go);
    } else {
      [x, y] = fieldPos(s.gx[i], s.gy[i], t);
    }
    let r = lerp(BASE_R * 0.5, BASE_R, go) + 0.022 * Math.exp(-(((age - 0.6) / 0.28) ** 2));

    // Rooms, sampled in screen orientation.
    const sx = x * cosT - y * sinT;
    const sy = x * sinT + y * cosT;
    const front = clamp01((s.dist[i] - 0.3) / 2.5) * 1.2;
    // Dots never grow past the matrix spacing, so they never merge.
    r = Math.min(r + roomRadius(s, sx, sy, t, front), 0.045);

    // The logo forms from the nearest dots; the rest shrink away.
    const j = s.logoOf[i];
    if (t >= LOGO_START) {
      if (j >= 0) {
        const k = span(t, s.morphAt[i], LOGO_TRAVEL);
        // Size arrives ahead of position, so the dots gathering into the
        // logo are already full-bodied while they travel.
        const grow = span(t, s.morphAt[i] - 0.05, 0.6, fade);
        x = lerp(x, s.lx[j], k);
        y = lerp(y, s.ly[j], k);
        r = lerp(r, s.lr[j], grow);
        if (k >= 1) {
          x = s.lx[j] * out + shake * Math.sin(t * 38 + j * 1.7);
          y = s.ly[j] * out + shake * Math.cos(t * 43 + j * 2.3);
          px[i] = x;
          py[i] = y;
          if (r >= minR) {
            wedges[s.lw[j]].moveTo(x + r, y);
            wedges[s.lw[j]].arc(x, y, r, 0, Math.PI * 2);
          }
          continue;
        }
      } else {
        r *= 1 - span(t, s.morphAt[i], 0.5);
      }
    }

    px[i] = x;
    py[i] = y;
    if (t < HANDOFF_END && s.hidden[i]) continue;
    if (r < minR || x * x + y * y > view * view) continue;
    dots.moveTo(x + r, y);
    dots.arc(x, y, r, 0, Math.PI * 2);
  }
  ctx.fill(dots);
  for (const b of bridges) ctx.fill(b);

  // The logo: each wedge's dots through the wedge's outline. Near the
  // triangle the dots overlap into the solid bands, as in the logo itself.
  wedges.forEach((wedge, w) => {
    ctx.save();
    ctx.scale(out, out);
    ctx.clip(s.masks[w]);
    ctx.scale(1 / out, 1 / out);
    ctx.fill(wedge);
    ctx.restore();
  });

  // The next first dot, growing in the empty triangle as the camera dives
  // in. It ends the loop at the size and place the story starts from.
  if (t > RESEED) {
    const onScreen = SEED_R * camera(0).zoom * span(t, RESEED, STORY_END - RESEED, fade);
    ctx.beginPath();
    ctx.arc(0, 0, onScreen / zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // Room names, as on the ISD doors.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const inset = width < 480 ? 16 : 24;
  ctx.font = `16px ${palette.font}`;
  for (const l of LABELS) {
    const a = span(t, l.from, 0.4, fade) * (1 - span(t, l.to, 0.3, fade));
    if (a <= 0) continue;
    ctx.globalAlpha = a;
    ctx.fillText(l.text, inset, height - inset);
  }
  ctx.globalAlpha = 1;
}

/**
 * The gooey bridge between two circles, after Hiroyuki Sato's metaball
 * construction: two curves leave one circle and land on the other, pinching
 * as they part and vanishing once the gap passes `r1 + 2.5 × r2`.
 */
function metaballBridge(
  path: Path2D,
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
) {
  const v = 0.5;
  const handle = 2.4;
  const d = Math.hypot(x2 - x1, y2 - y1);
  if (r1 <= 0 || r2 <= 0 || d > r1 + r2 * 2.5 || d <= Math.abs(r1 - r2)) return;
  let u1 = 0;
  let u2 = 0;
  if (d < r1 + r2) {
    u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
    u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
  }
  const between = Math.atan2(y2 - y1, x2 - x1);
  const spread = Math.acos((r1 - r2) / d);
  const a1 = between + u1 + (spread - u1) * v;
  const a2 = between - u1 - (spread - u1) * v;
  const a3 = between + Math.PI - u2 - (Math.PI - u2 - spread) * v;
  const a4 = between - Math.PI + u2 + (Math.PI - u2 - spread) * v;
  const at = (x: number, y: number, a: number, r: number): [number, number] => [
    x + r * Math.cos(a),
    y + r * Math.sin(a),
  ];
  const p1 = at(x1, y1, a1, r1);
  const p2 = at(x1, y1, a2, r1);
  const p3 = at(x2, y2, a3, r2);
  const p4 = at(x2, y2, a4, r2);
  const total = r1 + r2;
  const d2 =
    Math.min(v * handle, Math.hypot(p3[0] - p1[0], p3[1] - p1[1]) / total) *
    Math.min(1, (d * 2) / total);
  const h1 = at(p1[0], p1[1], a1 - Math.PI / 2, r1 * d2);
  const h2 = at(p2[0], p2[1], a2 + Math.PI / 2, r1 * d2);
  const h3 = at(p3[0], p3[1], a3 + Math.PI / 2, r2 * d2);
  const h4 = at(p4[0], p4[1], a4 - Math.PI / 2, r2 * d2);
  path.moveTo(p1[0], p1[1]);
  path.bezierCurveTo(h1[0], h1[1], h3[0], h3[1], p3[0], p3[1]);
  path.lineTo(p4[0], p4[1]);
  path.bezierCurveTo(h4[0], h4[1], h2[0], h2[1], p2[0], p2[1]);
  path.closePath();
}
