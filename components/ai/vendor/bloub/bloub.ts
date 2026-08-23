/*
 * Static cloud/expression renderer adapted from jeremy-prt/bloub (MIT).
 * It keeps the source project's measured 16-expression face model, spherical
 * eye projection, analytic cloud silhouette, and capsule geometry. The React
 * host supplies the clock and interaction state.
 */

export type BloubExpressionId =
  | "neutral"
  | "attentive"
  | "surprised"
  | "excited"
  | "happy"
  | "laughing"
  | "angry"
  | "sad"
  | "scared"
  | "suspicious"
  | "confused"
  | "curious"
  | "proud"
  | "shy"
  | "unimpressed"
  | "sleepy";

export interface BloubEyeConfig {
  w: number;
  h: number;
  tilt: number;
  open: number;
}

export interface BloubExpression {
  id: BloubExpressionId;
  gaze: { yaw: number; pitch: number; roll: number };
  split: number;
  eyes: [BloubEyeConfig, BloubEyeConfig];
}

export interface BloubEyeFrame {
  d: string;
  matrix: string;
  opacity: number;
}

export interface BloubFrame {
  bodyPath: string;
  eyes: BloubEyeFrame[];
}

const SAMPLES = 64;
const EYE_SPLIT = 15.46;
const EYE_W = 0.186;
const EYE_H = 0.412;
const REST_GAZE = { yaw: 28.49, pitch: 28.62, roll: -13 };
const SCALE = 100;
const TAU = Math.PI * 2;

const eye = (w: number, h: number, tilt = 0, open = 1): BloubEyeConfig => ({
  w,
  h,
  tilt,
  open,
});

const pair = (
  w: number,
  h: number,
  tilt = 0,
  open = 1,
): [BloubEyeConfig, BloubEyeConfig] => [
  eye(w, h, tilt, open),
  eye(w, h, -tilt, open),
];

export const BLOUB_EXPRESSIONS: Record<BloubExpressionId, BloubExpression> = {
  neutral: {
    id: "neutral",
    gaze: { ...REST_GAZE },
    split: EYE_SPLIT,
    eyes: [eye(EYE_W, EYE_H), eye(EYE_W, EYE_H)],
  },
  attentive: {
    id: "attentive",
    gaze: { yaw: 4, pitch: 5, roll: -4 },
    split: 16,
    eyes: pair(0.21, 0.44),
  },
  surprised: {
    id: "surprised",
    gaze: { yaw: 3, pitch: -3, roll: 0 },
    split: 19,
    eyes: pair(0.45, 0.47),
  },
  excited: {
    id: "excited",
    gaze: { yaw: 6, pitch: -14, roll: 0 },
    split: 19.5,
    eyes: pair(0.4, 0.56, -10),
  },
  happy: {
    id: "happy",
    gaze: { yaw: 5, pitch: 9, roll: 0 },
    split: 17,
    eyes: pair(0.27, 0.17, 14),
  },
  laughing: {
    id: "laughing",
    gaze: { yaw: 4, pitch: 14, roll: 0 },
    split: 18,
    eyes: pair(0.34, 0.13, 20),
  },
  angry: {
    id: "angry",
    gaze: { yaw: 3, pitch: 7, roll: 0 },
    split: 17,
    eyes: pair(0.34, 0.15, 30),
  },
  sad: {
    id: "sad",
    gaze: { yaw: 3, pitch: -13, roll: 0 },
    split: 16,
    eyes: pair(0.22, 0.4, -28),
  },
  scared: {
    id: "scared",
    gaze: { yaw: 2, pitch: -20, roll: 0 },
    split: 20.5,
    eyes: pair(0.4, 0.6),
  },
  suspicious: {
    id: "suspicious",
    gaze: { yaw: 12, pitch: 6, roll: -6 },
    split: 16,
    eyes: [eye(0.21, 0.4), eye(0.22, 0.15)],
  },
  confused: {
    id: "confused",
    gaze: { yaw: -14, pitch: 3, roll: 8 },
    split: 16.5,
    eyes: [eye(0.2, 0.44, -18), eye(0.28, 0.17, 14)],
  },
  curious: {
    id: "curious",
    gaze: { yaw: 16, pitch: -9, roll: -15 },
    split: 16.5,
    eyes: [eye(0.24, 0.46, -8), eye(0.2, 0.38, -8)],
  },
  proud: {
    id: "proud",
    gaze: { yaw: 5, pitch: 17, roll: 0 },
    split: 17,
    eyes: pair(0.3, 0.15, 18),
  },
  shy: {
    id: "shy",
    gaze: { yaw: -19, pitch: -14, roll: -7 },
    split: 14,
    eyes: pair(0.17, 0.3),
  },
  unimpressed: {
    id: "unimpressed",
    gaze: { yaw: -22, pitch: 2, roll: 0 },
    split: 16,
    eyes: pair(0.3, 0.12),
  },
  sleepy: {
    id: "sleepy",
    gaze: { yaw: 6, pitch: -9, roll: -3 },
    split: 16,
    eyes: pair(0.2, 0.42, 0, 0.42),
  },
};

export const BLOUB_EXPRESSION_IDS = Object.keys(
  BLOUB_EXPRESSIONS,
) as BloubExpressionId[];

const clamp = (value: number, min = 0, max = 1) =>
  value < min ? min : value > max ? max : value;
const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;
const round = (value: number) => Math.round(value * 100) / 100;
const angles = Array.from({ length: SAMPLES }, (_, index) =>
  (index / SAMPLES) * TAU,
);
const cosines = angles.map(Math.cos);
const sines = angles.map(Math.sin);

function unionOfCircles(
  circles: Array<{ x: number; y: number; radius: number }>,
) {
  return angles.map((_, index) => {
    const dx = cosines[index];
    const dy = sines[index];
    let farthest = 0;
    for (const circle of circles) {
      const projection = dx * circle.x + dy * circle.y;
      const discriminant =
        projection * projection -
        (circle.x * circle.x +
          circle.y * circle.y -
          circle.radius * circle.radius);
      if (discriminant >= 0) {
        farthest = Math.max(farthest, projection + Math.sqrt(discriminant));
      }
    }
    return farthest;
  });
}

function normalize(radii: number[], maximum: number) {
  const peak = Math.max(...radii);
  return radii.map((radius) => (radius * maximum) / peak);
}

const CLOUD_RADII = normalize(
  unionOfCircles([
    { x: -0.44, y: 0.2, radius: 0.54 },
    { x: 0.46, y: 0.2, radius: 0.5 },
    { x: 0.02, y: 0.3, radius: 0.6 },
    { x: -0.24, y: -0.3, radius: 0.48 },
    { x: 0.3, y: -0.24, radius: 0.44 },
  ]),
  1.02,
);

function closedPath() {
  const points = CLOUD_RADII.map((radius, index) => ({
    x: radius * cosines[index] * SCALE,
    y: radius * sines[index] * SCALE,
  }));
  const first = points[0];
  let path = `M${round(first.x)} ${round(first.y)}`;
  for (let index = 0; index < points.length; index += 1) {
    const p0 = points[(index - 1 + points.length) % points.length];
    const p1 = points[index];
    const p2 = points[(index + 1) % points.length];
    const p3 = points[(index + 2) % points.length];
    path +=
      `C${round(p1.x + (p2.x - p0.x) / 6)} ` +
      `${round(p1.y + (p2.y - p0.y) / 6)} ` +
      `${round(p2.x - (p3.x - p1.x) / 6)} ` +
      `${round(p2.y - (p3.y - p1.y) / 6)} ` +
      `${round(p2.x)} ${round(p2.y)}`;
  }
  return `${path}Z`;
}

export const BLOUB_CLOUD_PATH = closedPath();

function radiusAtAngle(angle: number) {
  const unit = ((((angle / TAU) % 1) + 1) % 1) * SAMPLES;
  const index = Math.floor(unit);
  return lerp(
    CLOUD_RADII[index % SAMPLES],
    CLOUD_RADII[(index + 1) % SAMPLES],
    unit - index,
  );
}

type Vec3 = [number, number, number];

function spin(u: Vec3, v: Vec3, angle: number): [Vec3, Vec3] {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    [
      u[0] * cosine + v[0] * sine,
      u[1] * cosine + v[1] * sine,
      u[2] * cosine + v[2] * sine,
    ],
    [
      v[0] * cosine - u[0] * sine,
      v[1] * cosine - u[1] * sine,
      v[2] * cosine - u[2] * sine,
    ],
  ];
}

function eyePoses(
  gaze: { yaw: number; pitch: number; roll: number },
  split: number,
) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  let forward: Vec3 = [0, 0, 1];
  let right: Vec3 = [1, 0, 0];
  let down: Vec3 = [0, 1, 0];
  [forward, right] = spin(forward, right, radians(gaze.yaw));
  [down, forward] = spin(down, forward, radians(gaze.pitch));
  [right, down] = spin(right, down, radians(gaze.roll));

  return [-1, 1].map((side) => {
    const [eyeForward, eyeRight] = spin(
      forward,
      right,
      radians(split * side),
    );
    return {
      x: eyeForward[0] * SCALE,
      y: eyeForward[1] * SCALE,
      a: eyeRight[0],
      b: eyeRight[1],
      c: down[0],
      d: down[1],
      depth: eyeForward[2],
    };
  });
}

function capsulePath(width: number, height: number) {
  const halfWidth = Math.max(width, 0.01) / 2;
  const halfHeight = Math.max(height, 0.01) / 2;
  const radius = Math.min(halfWidth, halfHeight);
  return (
    `M${round(-halfWidth)} ${round(-halfHeight + radius)}` +
    `A${round(radius)} ${round(radius)} 0 0 1 ${round(-halfWidth + radius)} ${round(-halfHeight)}` +
    `L${round(halfWidth - radius)} ${round(-halfHeight)}` +
    `A${round(radius)} ${round(radius)} 0 0 1 ${round(halfWidth)} ${round(-halfHeight + radius)}` +
    `L${round(halfWidth)} ${round(halfHeight - radius)}` +
    `A${round(radius)} ${round(radius)} 0 0 1 ${round(halfWidth - radius)} ${round(halfHeight)}` +
    `L${round(-halfWidth + radius)} ${round(halfHeight)}` +
    `A${round(radius)} ${round(radius)} 0 0 1 ${round(-halfWidth)} ${round(halfHeight - radius)}Z`
  );
}

export function blendBloubExpression(
  from: BloubExpression,
  to: BloubExpression,
  amount: number,
): BloubExpression {
  const blendEye = (a: BloubEyeConfig, b: BloubEyeConfig) => ({
    w: lerp(a.w, b.w, amount),
    h: lerp(a.h, b.h, amount),
    tilt: lerp(a.tilt, b.tilt, amount),
    open: lerp(a.open, b.open, amount),
  });
  return {
    id: to.id,
    gaze: {
      yaw: lerp(from.gaze.yaw, to.gaze.yaw, amount),
      pitch: lerp(from.gaze.pitch, to.gaze.pitch, amount),
      roll: lerp(from.gaze.roll, to.gaze.roll, amount),
    },
    split: lerp(from.split, to.split, amount),
    eyes: [blendEye(from.eyes[0], to.eyes[0]), blendEye(from.eyes[1], to.eyes[1])],
  };
}

export function renderBloubFrame({
  expression,
  gazeX,
  gazeY,
  gazeMix,
  lid,
}: {
  expression: BloubExpression;
  gazeX: number;
  gazeY: number;
  gazeMix: number;
  lid: number;
}): BloubFrame {
  const gaze = {
    yaw: lerp(expression.gaze.yaw, gazeX * 26, gazeMix),
    pitch: lerp(expression.gaze.pitch, -gazeY * 20 + 4, gazeMix),
    roll: expression.gaze.roll,
  };
  const poses = eyePoses(gaze, expression.split);
  const eyes = poses.flatMap((pose, index): BloubEyeFrame[] => {
    if (pose.depth <= 0.02) return [];
    const config = expression.eyes[index];
    const fit = radiusAtAngle(Math.atan2(pose.y, pose.x));
    const angle = (config.tilt * Math.PI) / 180;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const ax = pose.a * cosine + pose.c * sine;
    const ay = pose.b * cosine + pose.d * sine;
    const cx = -pose.a * sine + pose.c * cosine;
    const cy = -pose.b * sine + pose.d * cosine;
    const blink = 0.06 + 0.94 * clamp(Math.min(lid, config.open));
    return [
      {
        d: capsulePath(config.w * SCALE, config.h * SCALE),
        matrix: `matrix(${round(ax)},${round(ay * blink)},${round(cx)},${round(cy * blink)},${round(pose.x * fit)},${round(pose.y * fit)})`,
        opacity: clamp(pose.depth / 0.12),
      },
    ];
  });

  return { bodyPath: BLOUB_CLOUD_PATH, eyes };
}
