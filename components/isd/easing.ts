/**
 * The curves Matt animates with, read from the Kedonia Lottie exports
 * (doc/isd-dot-hero-plan.md): a calm start and a long, soft landing for
 * anything that moves or scales, and an immediate arrival that settles for
 * fades. No overshoot anywhere.
 */

/** A CSS-style cubic-bézier timing function, solved for x by Newton steps. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const ax = 3 * x1 - 3 * x2 + 1;
  const bx = 3 * x2 - 6 * x1;
  const cx = 3 * x1;
  const ay = 3 * y1 - 3 * y2 + 1;
  const by = 3 * y2 - 6 * y1;
  const cy = 3 * y1;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-5) break;
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    // Bisection fallback where Newton's slope vanishes (the curves here
    // start with a zero-slope handle).
    if (Math.abs(sampleX(t) - x) > 1e-4) {
      let lo = 0;
      let hi = 1;
      t = x;
      for (let i = 0; i < 24; i++) {
        const v = sampleX(t);
        if (v < x) lo = t;
        else hi = t;
        t = (lo + hi) / 2;
      }
    }
    return sampleY(t);
  };
}

/** Move and scale: Kedonia's most used timed curve. */
export const move = cubicBezier(0.5, 0, 0, 1);
/** Fades: arrive at once, settle long. */
export const fade = cubicBezier(0, 0, 0, 1);

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Progress of a beat from `start` lasting `duration`, eased. */
export function span(t: number, start: number, duration: number, ease = move) {
  return ease(clamp01((t - start) / duration));
}
