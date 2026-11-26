"use client";

import { DistortionWave, type CaptureFunction, type DistortionWaveHandle } from "distortion-waves";
import { useCallback, useRef, type CSSProperties } from "react";
import { gradientWave, pullCardWaveDuration, pullCardWaveStyle, scrubForPull } from "@/components/effects/gradient-reveal";
import { SiteSquircle } from "@/components/SiteSquircle";
import type { Act } from "./stageshow/act";
import { Stage } from "./stageshow/stage";
import styles from "./ReleasePreviews.module.css";

type CardState = { pull: number; offsetX: number; offsetY: number; revealed: boolean };
const atRest: CardState = { pull: 0, offsetX: 0, offsetY: 0, revealed: false };
const cursor = { at: { x: 256, y: 281 }, style: "large" } as const;
const stageWidth = 318;
const stageHeight = 418;
const waveStyle = { ...pullCardWaveStyle, pull: 12, amplitude: 21, aberration: 0.55 };

function waveSource(x: number, y: number) {
  // A broad source across the bottom keeps the wave reading as a sweep at this size.
  return {
    x: -48 + (x - stageWidth / 2) * 0.15,
    y: stageHeight - 18 + (y - stageHeight / 2) * 0.3,
    w: stageWidth + 96,
    h: 24,
  };
}

const captureSurface: CaptureFunction = ({ element, slot, width, height, scale, background }) => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const paint = canvas.getContext("2d", { alpha: false });
  if (!paint) return canvas;

  // Paint opaque textures so the lens samples the page colors at every edge.
  const surface = element.querySelector<HTMLElement>(`[data-dw-layer="${slot}"] > div`);
  paint.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  paint.fillStyle = surface ? getComputedStyle(surface).backgroundColor : background;
  paint.fillRect(0, 0, width, height);
  if (slot !== "revealed" || !surface) return canvas;

  const bounds = element.getBoundingClientRect();
  const scaleX = width / bounds.width;
  const scaleY = height / bounds.height;
  for (const row of surface.children) {
    const rect = row.getBoundingClientRect();
    const ink = getComputedStyle(row);
    const left = (rect.left - bounds.left) * scaleX;
    const top = (rect.top - bounds.top) * scaleY;
    const rowWidth = rect.width * scaleX;
    const rowHeight = rect.height * scaleY;
    paint.fillStyle = ink.getPropertyValue("--pull-row-ink").trim();
    paint.fillRect(left, top + rowHeight / 2 - 2, rowWidth * 0.48, 4);
    paint.fillStyle = ink.borderBottomColor;
    paint.fillRect(left, top + rowHeight - 1, rowWidth, 1);
  }
  return canvas;
};

export function PullCardScene() {
  const wave = useRef<DistortionWaveHandle>(null);
  const script = useCallback(async (a: Act<CardState>) => {
    a.mark("ready");
    void wave.current?.prepare();
    await a.wait(480);
    await a.move("badge");
    const { x, y } = a.center("badge");
    await a.drag({ x: x + 14, y: y + 72 }, (point, from, progress) => {
      a.put({ pull: progress, offsetX: point.x - from.x, offsetY: point.y - from.y });
      wave.current?.controller?.moveSource(waveSource(point.x, point.y));
    }, { duration: 760 });
    await a.set({ revealed: true });
    a.mark("revealed");
    await a.move({ x: x + 89, y: y + 114 });
    await a.wait(pullCardWaveDuration * 1000);
    await a.set(atRest);
    await a.move(cursor.at);
    await a.wait(pullCardWaveDuration * 1000 / pullCardWaveStyle.returnSpeed);
  }, []);

  return (
    <div className={styles.pullStage} style={{ "--pull-stage-ratio": stageWidth / stageHeight } as CSSProperties}>
      <Stage width={stageWidth} height={stageHeight} fill play="loop" cursor={cursor} initial={atRest} poster={atRest} script={script}>
        {({ pull, offsetX, offsetY, revealed }, rect) => {
          const badge = rect("badge");
          return (
            <DistortionWave
              {...gradientWave}
              ref={wave}
              className={styles.pullScene}
              style={{ "--pull": pull, "--pull-x": `${offsetX}px`, "--pull-y": `${offsetY}px` } as CSSProperties}
              waveStyle={waveStyle}
              capture={captureSurface}
              source={waveSource(badge.x + badge.width / 2, badge.y + badge.height / 2)}
              scrub={pull > 0 && !revealed ? scrubForPull(pull) : null}
              revealed={revealed}
              revealedContent={<div className={styles.revealPage}><span /><span /><span /></div>}
              overlay={(
                <div className={`walkthrough-splash-sheet ${styles.lanyard}`} data-revealed={revealed}>
                  <div className={styles.strap} />
                  <SiteSquircle className={styles.badge} data-target="badge" data-cursor="open">
                    <span className={styles.badgeMark} />
                    <span className={styles.badgeSticker} />
                    <span className={styles.badgeRules} />
                  </SiteSquircle>
                </div>
              )}
            >
              <div className={styles.pullBackdrop} />
            </DistortionWave>
          );
        }}
      </Stage>
    </div>
  );
}
