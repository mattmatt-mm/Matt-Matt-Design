"use client";

import { snapshot, WaveController, type CaptureFunction, type WaveOptions } from "distortion-waves";
import { type CSSProperties, type MouseEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ExperienceBadge } from "@/components/ExperienceBadge";
import { signatureImages } from "@/components/Signature";
import { GRADIENT_FEATHER, gradientWave, pullCardWaveStyle, scrubForPull, wipeGradientSheet } from "@/components/effects/gradient-reveal";
import type { LanyardPull } from "@/components/vendor/react-bits-lanyard/Lanyard";
import type { BadgeSticker } from "@/lib/content";
import { endPortfolioLaunch } from "@/lib/portfolio-launch";
import styles from "./PortfolioLaunch.module.css";

const WAVE_DEADLINE_MS = 4000;
const LOAD_DEADLINE_MS = 12000;
const BADGE_EXIT_DELAY_MS = 100;
const GRAB_FOLLOW_MS = 48;
const RELEASE_SETTLE_MS = 80;
const signatureSources = Object.values(signatureImages);
const loadingSteps = signatureSources.length + 1;
const percentages = Array.from({ length: loadingSteps + 1 }, (_, step) =>
  Math.max(1, Math.round(100 * step / loadingSteps)),
);
type GrabPoint = Parameters<LanyardPull>[2];
type PullRelease = { point: GrabPoint; progress: number };

function moveWaveOrigin(controller: WaveController, button: HTMLButtonElement, point: GrabPoint) {
  const bounds = controller.root.getBoundingClientRect();
  const x = Math.max(0, Math.min(bounds.width, point.clientX - bounds.left));
  const y = Math.max(0, Math.min(bounds.height, point.clientY - bounds.top));
  const w = button.offsetWidth;
  const h = button.offsetHeight;
  controller.moveSource({ x: x - w / 2, y: y - h / 2, w, h });
}

async function pictureSurface(target: HTMLElement, { width, height, scale, ignore }: Parameters<CaptureFunction>[0]) {
  const { canvas } = await snapshot(target, {
    width,
    height,
    scale,
    background: getComputedStyle(document.body).backgroundColor,
    skip: (node) => ignore(node) || node.matches("dialog, nextjs-portal, [data-dw-skip]"),
    force: (node) => {
      const borderWidth = { "border-width": getComputedStyle(node).borderWidth };
      if (node !== target) return borderWidth;
      return {
        ...borderWidth,
        position: "absolute",
        inset: "0",
        margin: "0",
        width: `${width}px`,
        height: `${height}px`,
        opacity: "1",
        visibility: "visible",
      };
    },
  });
  return canvas;
}

export function PortfolioLaunch({
  name,
  role,
  stickers,
  embedded = false,
  children,
}: {
  name: string;
  role: string;
  stickers: BadgeSticker[];
  embedded?: boolean;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const enterButton = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const intro = useRef<HTMLDivElement>(null);
  const home = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const wave = useRef<{ controller: WaveController; options: WaveOptions } | null>(null);
  const wipe = useRef<Animation | null>(null);
  const releaseFrame = useRef(0);
  const followedGrab = useRef<(GrabPoint & { time: number }) | null>(null);
  const deadline = useRef(0);
  const entered = useRef(false);
  const readyAssets = useRef(new Set<string | null>());
  const [active, setActive] = useState(false);
  const [entering, setEntering] = useState(false);
  const [phase, setPhase] = useState<"loading" | "dropping" | "signing" | "static">("loading");
  const [loadedAssets, setLoadedAssets] = useState(0);
  const loading = phase === "loading";
  const staticBadge = phase === "static";
  const canEnter = phase === "signing" || staticBadge;
  const progress = percentages[loadedAssets];
  const loaded = progress === 100;
  const enterLabel = staticBadge ? "Enter portfolio" : "Enter portfolio. Pull the card or tap here to start.";
  const markAssetReady = useCallback((asset: string | null) => {
    readyAssets.current.add(asset);
    setLoadedAssets(readyAssets.current.size);
  }, []);
  const markCardReady = useCallback(() => markAssetReady(null), [markAssetReady]);

  useLayoutEffect(() => {
    const screen = dialog.current;
    const { dataset } = document.documentElement;
    if (!screen || dataset.portfolioLaunch !== "pending") return;

    try {
      screen.showModal();
    } catch {
      endPortfolioLaunch();
      return;
    }
    dataset.portfolioLaunch = "open";
    enterButton.current?.focus({ preventScroll: true });
    setActive(true);

    return () => {
      screen.close();
      if (dataset.portfolioLaunch !== "open") return;
      dataset.portfolioLaunch = "pending";
      // Strict Mode can immediately reopen the dialog after cleanup.
      queueMicrotask(() => {
        if (!screen.open && dataset.portfolioLaunch === "pending") endPortfolioLaunch();
      });
    };
  }, []);

  const finish = useCallback(() => {
    const screen = dialog.current;
    if (!screen?.open) return;
    screen.close();
    cancelAnimationFrame(releaseFrame.current);
    clearTimeout(deadline.current);
    wipe.current?.cancel();
    setActive(false);
    setEntering(false);
    endPortfolioLaunch();
    document.getElementById("portfolio-home")?.focus({ preventScroll: true });
  }, []);

  const skip = useCallback(() => {
    if (!dialog.current?.open || entered.current) return;
    entered.current = true;
    finish();
  }, [finish]);

  const showStaticBadge = useCallback(() => {
    if (!dialog.current?.open || entered.current) return;
    setPhase("static");
  }, []);

  useEffect(() => {
    if (!active || !loading) return;
    let cancelled = false;

    for (const source of signatureSources) {
      const image = new Image();
      image.src = source;
      void image.decode().then(() => {
        if (!cancelled) markAssetReady(source);
      }, () => {
        if (!cancelled) showStaticBadge();
      });
    }

    return () => { cancelled = true; };
  }, [active, loading, markAssetReady, showStaticBadge]);

  useEffect(() => {
    if (!active || !loading || loaded) return;
    const timeout = window.setTimeout(() => {
      // The renderer can finish in the same task as the deadline, before React paints 100%.
      if (readyAssets.current.size < loadingSteps) showStaticBadge();
    }, LOAD_DEADLINE_MS);
    return () => clearTimeout(timeout);
  }, [active, loaded, loading, showStaticBadge]);

  useEffect(() => {
    if (!active || !loading || !loaded) return;
    let dropFrame = 0;
    // Paint the completed percentage before revealing the card.
    const readyFrame = requestAnimationFrame(() => {
      dropFrame = requestAnimationFrame(() => {
        if (entered.current) return;
        setPhase(matchMedia("(prefers-reduced-motion: reduce)").matches ? "signing" : "dropping");
      });
    });
    return () => {
      cancelAnimationFrame(readyFrame);
      cancelAnimationFrame(dropFrame);
    };
  }, [active, loaded, loading]);

  useEffect(() => {
    const layer = root.current;
    const before = intro.current;
    const after = home.current;
    if (!active || loading || staticBadge || !layer || !before || !after) return;

    const controller = new WaveController(layer, before, after);
    const options: WaveOptions = {
      ...gradientWave,
      source: enterButton.current,
      waveStyle: pullCardWaveStyle,
      capture: (request) => pictureSurface(request.slot === "revealed" ? document.body : before, request),
      onFinish: (revealed) => {
        if (revealed && entered.current) finish();
      },
    };
    wave.current = { controller, options };
    controller.update(options);

    return () => {
      cancelAnimationFrame(releaseFrame.current);
      clearTimeout(deadline.current);
      wipe.current?.cancel();
      controller.destroy();
      wave.current = null;
    };
  }, [active, finish, loading, staticBadge]);

  useEffect(() => {
    if (!active || phase !== "signing" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const controller = wave.current?.controller;
    // Start prewarming after the drop has finished.
    void document.fonts.ready.then(() => controller?.prepare());
  }, [active, phase]);

  const enter = useCallback((release?: PullRelease) => {
    const screen = dialog.current;
    if (!screen?.open || entered.current) return;
    entered.current = true;
    const effect = wave.current;
    const card = badge.current;
    const button = enterButton.current;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !screen.animate || !effect || !card || !button) {
      finish();
      return;
    }

    setEntering(true);
    const { controller, options } = effect;
    const play = () => {
      if (!screen.open) return;
      wipe.current = wipeGradientSheet(card, BADGE_EXIT_DELAY_MS);
      if (release) controller.update({ ...options, revealed: true, scrub: null });
      else controller.play();
    };

    if (release) {
      const previous = followedGrab.current;
      followedGrab.current = null;
      const from = previous ?? release.point;
      const dx = release.point.clientX - from.clientX;
      const dy = release.point.clientY - from.clientY;
      if (!previous) controller.update({ ...options, scrub: scrubForPull(release.progress) });

      // Let the held wave catch up to the release point before it expands.
      const start = performance.now();
      const settle = (time: number) => {
        const progress = Math.hypot(dx, dy) <= 1 ? 1 : Math.min(1, (time - start) / RELEASE_SETTLE_MS);
        const eased = 1 - (1 - progress) ** 3;
        moveWaveOrigin(controller, button, { clientX: from.clientX + dx * eased, clientY: from.clientY + dy * eased });
        if (progress < 1) releaseFrame.current = requestAnimationFrame(settle);
        else play();
      };
      settle(start);
    } else {
      play();
    }
    deadline.current = window.setTimeout(finish, WAVE_DEADLINE_MS);
  }, [finish]);

  const handlePull = useCallback<LanyardPull>((progress, phase, point) => {
    if (entered.current) return;
    const effect = wave.current;
    if (phase !== "drag") {
      if (phase === "release" && progress >= 1) {
        enter({ progress, point });
      } else if (followedGrab.current) {
        followedGrab.current = null;
        effect?.controller.reverse();
      }
      return;
    }

    const button = enterButton.current;
    if (!effect || !button || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const time = performance.now();
    const previous = followedGrab.current ?? { ...point, time };
    const blend = 1 - Math.exp(-(time - previous.time) / GRAB_FOLLOW_MS);
    const next = {
      clientX: previous.clientX + (point.clientX - previous.clientX) * blend,
      clientY: previous.clientY + (point.clientY - previous.clientY) * blend,
      time,
    };
    followedGrab.current = next;
    effect.controller.update({ ...effect.options, scrub: scrubForPull(progress) });
    moveWaveOrigin(effect.controller, button, next);
  }, [enter]);

  function followProject(event: MouseEvent<HTMLDialogElement>) {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target === "_blank") return;
    finish();
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Portfolio launch"
      data-badge-phase={phase}
      data-embedded={embedded || undefined}
      onClickCapture={followProject}
      onCancel={(event) => {
        event.preventDefault();
        if (entering) finish();
        else if (canEnter) enter();
        else skip();
      }}
    >
      <div ref={root} className={styles.wave}>
        <div ref={intro} className={styles.intro}>
          <div className={styles.actions} inert={entering}>
            {loading && (
              <div className="sr-only" role="progressbar" aria-label="Loading card" aria-valuenow={progress} />
            )}
            <button
              ref={enterButton}
              type="button"
              data-dw-skip
              aria-label={canEnter ? enterLabel : `${progress}%. Skip introduction.`}
              onClick={canEnter ? () => enter() : skip}
              className={`${styles.enter} press-shrink`}
            >
              {percentages.map((value) => (
                <span
                  key={value}
                  aria-hidden="true"
                  className={`${styles.copy} ${styles.percentage}`}
                  data-current={value === progress ? "" : undefined}
                >
                  {value}%
                </span>
              ))}
              <span aria-hidden="true" className={`${styles.copy} ${styles.hello}`}>Hello</span>
              <span aria-hidden="true" className={`${styles.copy} ${styles.prompts}`}>
                <span className={styles.pull}>Pull the card</span>
                <span className={styles.tap}>{staticBadge ? "Tap here to start" : "Or tap here to start"}</span>
              </span>
            </button>
          </div>
        </div>
        <div ref={home} className={styles.home} aria-hidden="true" />
      </div>
      <div
        ref={badge}
        className={`walkthrough-splash-sheet ${styles.scene}`}
        style={{ "--splash-feather": `${GRADIENT_FEATHER}px` } as CSSProperties}
        inert={loading || entering}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && phase === "dropping") setPhase("signing");
        }}
      >
        <ExperienceBadge
          name={name}
          role={role}
          stickers={stickers}
          animate={active && !staticBadge}
          interactive={!entering && phase === "signing"}
          writeSignature={phase === "signing"}
          onPull={handlePull}
          onReady={markCardReady}
          onUnavailable={showStaticBadge}
        >
          {children}
        </ExperienceBadge>
      </div>
    </dialog>
  );
}
