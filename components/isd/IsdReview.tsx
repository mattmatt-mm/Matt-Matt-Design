"use client";

import { useEffect, useRef, useState } from "react";
import { IsdDotHero } from "./IsdDotHero";
import { BEATS, DURATION } from "./scene";

const SPEEDS = [0.25, 0.5, 1] as const;

/**
 * Review controls for the ISD dot hero: play/pause, a frame-accurate
 * scrubber, beat markers, slow motion and a frame-time readout. Not linked
 * from the site.
 */
export function IsdReview() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [frameMs, setFrameMs] = useState(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = 0;
    let avg = 16.7;
    const tick = (now: number) => {
      if (last) {
        const dt = now - last;
        avg = avg * 0.9 + dt * 0.1;
        setT((v) => (v + (Math.min(100, dt) / 1000) * speedRef.current) % DURATION);
        setFrameMs(avg);
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const beat = [...BEATS].reverse().find((b) => t >= b.start);

  return (
    <div className="isd-review">
      <div className="isd-review-stage">
        <IsdDotHero time={t} />
      </div>

      <div className="isd-review-controls">
        <button type="button" onClick={() => setPlaying((p) => !p)}>
          {playing ? "Pause" : "Play"}
        </button>
        <span className="isd-review-time">
          {t.toFixed(2)}s · {beat?.name}
        </span>
        <span className="text-muted">{frameMs ? `${(1000 / frameMs).toFixed(0)} fps` : ""}</span>
      </div>

      <input
        className="isd-review-scrubber"
        type="range"
        min={0}
        max={DURATION}
        step={1 / 60}
        value={t}
        aria-label="Time"
        onChange={(e) => {
          setPlaying(false);
          setT(Number(e.target.value));
        }}
      />

      <div className="isd-review-beats">
        {BEATS.map((b) => (
          <button
            key={b.name}
            type="button"
            aria-pressed={beat?.name === b.name}
            onClick={() => {
              setPlaying(false);
              setT(b.start);
            }}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="isd-review-controls">
        <span className="text-muted">Speed</span>
        {SPEEDS.map((s) => (
          <button key={s} type="button" aria-pressed={speed === s} onClick={() => setSpeed(s)}>
            {s}×
          </button>
        ))}
        <span className="text-muted">Step</span>
        <button type="button" onClick={() => { setPlaying(false); setT((v) => Math.max(0, v - 1 / 60)); }}>
          −1 frame
        </button>
        <button type="button" onClick={() => { setPlaying(false); setT((v) => Math.min(DURATION, v + 1 / 60)); }}>
          +1 frame
        </button>
      </div>
    </div>
  );
}
