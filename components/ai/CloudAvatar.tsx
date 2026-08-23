"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  BLOUB_EXPRESSIONS,
  blendBloubExpression,
  renderBloubFrame,
  type BloubExpression,
  type BloubExpressionId,
  type BloubFrame,
} from "@/components/ai/vendor/bloub/bloub";

const IDLE_AFTER_MS = 2_400;
const EXPRESSION_HOLD_MS = 4_800;
const EXPRESSION_MORPH_MS = 320;

const EXPRESSION_CYCLES: Record<
  BloubExpressionId,
  readonly BloubExpressionId[]
> = {
  neutral: [
    "neutral",
    "attentive",
    "curious",
    "happy",
    "suspicious",
    "sleepy",
    "surprised",
    "excited",
    "proud",
    "shy",
    "unimpressed",
    "confused",
    "laughing",
    "angry",
    "sad",
    "scared",
  ],
  attentive: ["attentive", "curious", "happy"],
  surprised: ["surprised", "excited", "attentive"],
  excited: ["excited", "happy", "laughing"],
  happy: ["happy", "proud", "excited"],
  laughing: ["laughing", "happy", "excited"],
  angry: ["angry", "suspicious", "unimpressed"],
  sad: ["sad", "shy", "attentive"],
  scared: ["scared", "surprised", "attentive"],
  suspicious: ["suspicious", "confused", "attentive"],
  confused: ["confused", "curious", "attentive"],
  curious: ["curious", "attentive", "happy"],
  proud: ["proud", "happy", "attentive"],
  shy: ["shy", "attentive", "happy"],
  unimpressed: ["unimpressed", "suspicious", "neutral"],
  sleepy: ["sleepy", "neutral", "attentive"],
};

function clamp(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function easeOutQuint(value: number) {
  const bounded = Math.max(0, Math.min(1, value));
  return 1 - (1 - bounded) ** 5;
}

function blinkLid(time: number) {
  const phase = time % 3_700;
  if (phase > 180) return 1;
  const ratio = phase / 180;
  return ratio < 0.45 ? 1 - ratio / 0.45 : (ratio - 0.45) / 0.55;
}

export function CloudAvatar({
  expression = "neutral",
}: {
  expression?: BloubExpressionId;
}) {
  const clipId = `cloud-${useId().replace(/:/g, "")}`;
  const root = useRef<HTMLSpanElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const lastPointerAt = useRef(0);
  const gaze = useRef({ x: 0, y: 0 });
  const morph = useRef<{
    id: BloubExpressionId;
    from: BloubExpression;
    to: BloubExpression;
    startedAt: number;
  }>({
    id: expression,
    from: BLOUB_EXPRESSIONS[expression],
    to: BLOUB_EXPRESSIONS[expression],
    startedAt: 0,
  });
  const [frame, setFrame] = useState<BloubFrame>(() =>
    renderBloubFrame({
      expression: BLOUB_EXPRESSIONS[expression],
      gazeX: 0,
      gazeY: 0,
      gazeMix: 0,
      lid: 1,
    }),
  );

  useEffect(() => {
    let animationFrame = 0;
    let previous = performance.now();
    let alive = true;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.current = { x: event.clientX, y: event.clientY };
      lastPointerAt.current = performance.now();
    };

    const tick = (now: number) => {
      if (!alive) return;
      const delta = Math.min(64, now - previous);
      previous = now;
      const bounds = root.current?.getBoundingClientRect();
      const isIdle = now - lastPointerAt.current > IDLE_AFTER_MS;
      const cycle = EXPRESSION_CYCLES[expression];
      const targetId = isIdle
        ? cycle[Math.floor(now / EXPRESSION_HOLD_MS) % cycle.length]
        : expression === "neutral"
          ? "attentive"
          : expression;

      const currentMorph = morph.current;
      const currentAmount = easeOutQuint(
        (now - currentMorph.startedAt) / EXPRESSION_MORPH_MS,
      );
      const currentExpression = blendBloubExpression(
        currentMorph.from,
        currentMorph.to,
        currentAmount,
      );
      if (targetId !== currentMorph.id) {
        morph.current = {
          id: targetId,
          from: currentExpression,
          to: BLOUB_EXPRESSIONS[targetId],
          startedAt: now,
        };
      }

      let targetX = Math.sin(now / 1_450) * 0.58;
      let targetY = Math.sin(now / 2_300 + 0.7) * 0.14;
      if (!isIdle && pointer.current && bounds) {
        targetX = clamp(
          (pointer.current.x - (bounds.left + bounds.width / 2)) /
            Math.max(1, window.innerWidth / 2),
        );
        targetY = clamp(
          (pointer.current.y - (bounds.top + bounds.height / 2)) /
            Math.max(1, window.innerHeight / 2),
        );
      }

      const catchUp = 1 - Math.exp(-delta / 110);
      gaze.current.x += (targetX - gaze.current.x) * catchUp;
      gaze.current.y += (targetY - gaze.current.y) * catchUp;
      const latestMorph = morph.current;
      const amount = easeOutQuint(
        (now - latestMorph.startedAt) / EXPRESSION_MORPH_MS,
      );
      const visibleExpression = blendBloubExpression(
        latestMorph.from,
        latestMorph.to,
        amount,
      );

      setFrame(
        renderBloubFrame({
          expression: visibleExpression,
          gazeX: gaze.current.x,
          gazeY: gaze.current.y,
          gazeMix: isIdle ? 0.68 : 0.92,
          lid: blinkLid(now),
        }),
      );
      animationFrame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    animationFrame = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [expression]);

  return (
    <span ref={root} className="cloud-avatar" aria-hidden="true">
      <svg
        className="cloud-avatar-svg"
        viewBox="-116 -116 232 232"
        focusable="false"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={frame.bodyPath} />
          </clipPath>
        </defs>
        <path d={frame.bodyPath} fill="var(--color-fg)" />
        <g clipPath={`url(#${clipId})`} fill="var(--color-bg)">
          {frame.eyes.map((eye, index) => (
            <path
              key={index}
              d={eye.d}
              transform={eye.matrix}
              opacity={eye.opacity}
            />
          ))}
        </g>
      </svg>
    </span>
  );
}
