"use client";

import Image from "next/image";
import { type CSSProperties, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BadgeSticker } from "@/lib/content";
import styles from "./ExperienceBadge.module.css";

const artwork = {
  "inside-lvmh": { src: "/images/profile/inside-lvmh.webp", width: 262, height: 264 },
  "wall-of-portfolios": { src: "/images/profile/wall-of-portfolios-silver-2026.webp", width: 135, height: 256 },
};

const yearLabels = {
  award: "Awarded in",
  certificate: "Earned in",
  feature: "Featured in",
};

function StickerArt({ sticker }: { sticker: BadgeSticker }) {
  return (
    <Image
      {...artwork[sticker.artwork]}
      className={styles.stickerArt}
      data-artwork={sticker.artwork}
      alt=""
      draggable={false}
      loading="eager"
      unoptimized
    />
  );
}

function motionOptions(overlay: HTMLDialogElement, closing = false) {
  const style = getComputedStyle(overlay);
  return {
    duration: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : parseFloat(style.getPropertyValue(closing ? "--sticker-close-dur" : "--sticker-open-dur")) || 300,
    easing: style.getPropertyValue("--sticker-ease").trim() || "ease-out",
  };
}

function onCard(trigger: HTMLButtonElement, preview: HTMLDivElement) {
  const source = trigger.getBoundingClientRect();
  const target = preview.getBoundingClientRect();
  const transform = getComputedStyle(trigger).transform;
  const matrix = new DOMMatrixReadOnly(transform === "none" ? undefined : transform);
  const angle = Math.atan2(matrix.b, matrix.a);
  const cos = Math.abs(Math.cos(angle));
  const sin = Math.abs(Math.sin(angle));
  const scale = Math.min(
    source.width / (target.width * cos + target.height * sin),
    source.height / (target.height * cos + target.width * sin),
  );
  const x = source.left + source.width / 2 - target.left - target.width / 2;
  const y = source.top + source.height / 2 - target.top - target.height / 2;
  return `translate(${x}px, ${y}px) rotate(${angle}rad) scale(${scale})`;
}

function StickerDetail({ sticker, trigger, onClose }: {
  sticker: BadgeSticker;
  trigger: HTMLButtonElement;
  onClose: () => void;
}) {
  const title = useId();
  const description = `${title}-description`;
  const dialog = useRef<HTMLDialogElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const travel = useRef<Animation>(null);
  const closing = useRef(false);

  useLayoutEffect(() => {
    const overlay = dialog.current;
    const image = preview.current;
    if (!overlay || !image) return;
    overlay.showModal();
    const motion = motionOptions(overlay);
    if (motion.duration > 0) {
      travel.current = image.animate([{ transform: onCard(trigger, image) }, { transform: "none" }], motion);
    }
    return () => {
      travel.current?.cancel();
      if (overlay.open) overlay.close();
    };
  }, [trigger]);

  function dismiss() {
    const overlay = dialog.current;
    const image = preview.current;
    if (!overlay?.open || !image || closing.current) return;
    closing.current = true;
    const finish = () => {
      overlay.close();
      onClose();
      trigger.focus({ preventScroll: true });
    };
    const motion = motionOptions(overlay, true);
    if (motion.duration === 0) {
      finish();
      return;
    }

    const from = getComputedStyle(image).transform;
    travel.current?.cancel();
    overlay.dataset.closing = "";
    travel.current = image.animate(
      [{ transform: from }, { transform: onCard(trigger, image) }],
      { ...motion, fill: "forwards" },
    );
    travel.current.onfinish = finish;
  }

  return (
    <dialog
      ref={dialog}
      className={styles.stickerDialog}
      aria-labelledby={title}
      aria-describedby={sticker.description ? description : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
      onCancel={(event) => {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      }}
      onKeyDown={(event) => {
        if (event.key !== " ") return;
        event.preventDefault();
        dismiss();
      }}
    >
      <figure className={styles.stickerFigure}>
        <div
          ref={preview}
          className={styles.stickerPreview}
          data-artwork={sticker.artwork}
          style={{ "--sticker-sheen-mask": `url("${artwork[sticker.artwork].src}")` } as CSSProperties}
        >
          <StickerArt sticker={sticker} />
        </div>
        <figcaption className={styles.stickerCaption}>
          <h2 id={title} className="text-section font-bold">{sticker.name}</h2>
          {sticker.description && (
            <p id={description} className={`${styles.stickerDescription} text-base text-muted-readable`}>
              {sticker.description}
            </p>
          )}
          {sticker.year !== null && (
            <p className={`${styles.stickerYear} text-base text-muted-readable`}>
              {yearLabels[sticker.kind]} {sticker.year}
            </p>
          )}
        </figcaption>
      </figure>
      <button className="sr-only" type="button" onClick={dismiss}>Close sticker</button>
    </dialog>
  );
}

export function BadgeStickers({ stickers }: { stickers: BadgeSticker[] }) {
  const [active, setActive] = useState<{ sticker: BadgeSticker; trigger: HTMLButtonElement } | null>(null);

  if (!stickers.length) return null;

  return (
    <>
      <div className={styles.stickers}>
        {stickers.map((sticker) => (
          <button
            key={sticker.artwork}
            className={styles.sticker}
            data-artwork={sticker.artwork}
            data-expanded={active?.sticker.artwork === sticker.artwork || undefined}
            type="button"
            aria-haspopup="dialog"
            onClick={(event) => setActive({ sticker, trigger: event.currentTarget })}
          >
            <StickerArt sticker={sticker} />
            <span className="sr-only">{sticker.name}{sticker.year === null ? "" : `, ${sticker.year}`}</span>
          </button>
        ))}
      </div>
      {active && createPortal(
        <StickerDetail {...active} onClose={() => setActive(null)} />,
        document.body,
      )}
    </>
  );
}
