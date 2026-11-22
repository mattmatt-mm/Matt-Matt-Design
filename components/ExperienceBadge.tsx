"use client";

import dynamic from "next/dynamic";
import { type CSSProperties, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Signature } from "@/components/Signature";
import { SiteSquircle } from "@/components/SiteSquircle";
import type { LanyardControls, LanyardPull } from "@/components/vendor/react-bits-lanyard/Lanyard";
import styles from "./ExperienceBadge.module.css";

const Lanyard = dynamic(() => import("@/components/vendor/react-bits-lanyard/Lanyard"), {
  ssr: false,
});
const SWING_ROOM = 64;

export function ExperienceBadge({
  name,
  role,
  children,
  animate = true,
  interactive = true,
  writeSignature = false,
  commentsHref,
  onPull,
  onReady,
  onUnavailable,
}: {
  name: string;
  role: string;
  children: ReactNode;
  animate?: boolean;
  interactive?: boolean;
  writeSignature?: boolean;
  commentsHref?: string;
  onPull?: LanyardPull;
  onReady?: () => void;
  onUnavailable?: () => void;
}) {
  const face = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const launchFrame = useRef<HTMLDivElement>(null);
  const controls = useRef<LanyardControls>(null);
  const [colors, setColors] = useState<{ card: string; strap: string }>();

  useEffect(() => {
    if (!animate) return;
    const root = document.documentElement;
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    function readColors() {
      const styles = getComputedStyle(root);
      setColors({
        card: styles.getPropertyValue("--color-surface").trim(),
        strap: styles.getPropertyValue("--color-fg").trim(),
      });
    }

    readColors();
    const observer = new MutationObserver(readColors);
    observer.observe(root, { attributes: true, attributeFilter: ["data-site-theme"] });
    scheme.addEventListener("change", readColors);
    return () => {
      observer.disconnect();
      scheme.removeEventListener("change", readColors);
    };
  }, [animate]);

  function moveBadge(event: KeyboardEvent<HTMLDivElement>) {
    const badge = controls.current;
    if (event.target !== event.currentTarget || !badge) return;
    switch (event.key) {
      case "ArrowLeft": badge.swing(-1); break;
      case "ArrowRight": badge.swing(1); break;
      case "ArrowDown": badge.pullDown(); break;
      case "Home": badge.reset(); break;
      default: return;
    }
    event.preventDefault();
  }

  return (
    <div
      className={styles.stage}
      data-launch={onPull ? "" : undefined}
      style={{ "--lanyard-swing-room": `${SWING_ROOM}px` } as CSSProperties}
    >
      <div className={styles.viewport}>
        {onPull && <div ref={launchFrame} className={styles.launchFrame} />}
        {animate && colors && (
          <Lanyard
            className={styles.scene}
            cardColor={colors.card}
            strapColor={colors.strap}
            finish="matte"
            size={0.74}
            strapLength={0.24}
            strapWidth={0.6}
            breeze={0}
            intro={false}
            interactive={interactive}
            damping={0.58}
            dragAxis="x"
            allowPullDown={!onPull}
            onPull={onPull}
            onReady={onReady}
            onUnavailable={onUnavailable}
            bottomSpace={SWING_ROOM}
            launchFrameRef={onPull ? launchFrame : undefined}
            frontFaceRef={face}
            backFaceRef={onPull ? back : undefined}
            controlsRef={controls}
          />
        )}
        <div
          ref={face}
          className={styles.face}
          role={onPull ? undefined : "group"}
          aria-label={onPull ? undefined : "Experience badge"}
          aria-keyshortcuts={onPull ? undefined : "ArrowLeft ArrowRight ArrowDown Home"}
          onKeyDown={onPull ? undefined : moveBadge}
        >
          <SiteSquircle className={styles.paper}>
            <header className={styles.heading}>
              <h1 className="text-sm font-bold">{name}</h1>
              <p>{role}</p>
            </header>
            <div className={styles.history}>{children}</div>
          </SiteSquircle>
        </div>
        {onPull && (
          <div
            ref={back}
            className={`${styles.face} ${styles.back}`}
            data-signing={writeSignature ? "" : undefined}
            aria-hidden="true"
          >
            <SiteSquircle className={`${styles.paper} ${styles.signaturePaper}`}>
              <Signature onFinish={() => controls.current?.showFront()} />
            </SiteSquircle>
          </div>
        )}
      </div>
      {commentsHref && (
        <a href={commentsHref} aria-label="Scroll down to comments" className={styles.hint}>
          Scroll down
        </a>
      )}
    </div>
  );
}
