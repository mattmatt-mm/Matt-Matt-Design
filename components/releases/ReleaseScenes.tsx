"use client";

import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import Image from "next/image";
import type { CSSProperties } from "react";
import { DynamicDock } from "@/components/library/DynamicDock";
import { SiteSquircle } from "@/components/SiteSquircle";
import type { ReleasePreview } from "@/lib/releases";
import "@/components/notes.css";
import { PullCardScene } from "./PullCardScene";
import type { Act } from "./stageshow/act";
import { Stage } from "./stageshow/stage";
import styles from "./ReleasePreviews.module.css";

const tabs = [
  { label: "Home", icon: House },
  { label: "Writing", icon: PenNib },
  { label: "Fun", icon: Sparkle },
  { label: "Browse", icon: MagnifyingGlass },
];

const noAction = () => {};
const cursor = { at: { x: 262, y: 103 }, style: "large" } as const;
const heroCursor = {
  at: { wide: { x: 512, y: 166 }, compact: { x: 272, y: 142 } },
  style: "large",
} as const;

async function contractDock(a: Act<{ compact: boolean }>) {
  a.mark("ready");
  await a.wait(350);
  await a.click("story");
  await a.set({ compact: true });
  a.mark("compact");
  await a.wait(1100);
  const dock = a.rect("hero-dock");
  await a.click({ at: "hero-dock", x: 0.5 - dock.height / (2 * dock.width) });
  await a.set({ compact: false });
  await a.move(heroCursor.at[a.layout]);
}

async function slideDock(a: Act<{ index: number; drag: number | null }>) {
  a.mark("ready");
  const start = { at: "dock", x: 0.135 };
  const end = { at: "dock", x: 0.62 };
  await a.wait(760);
  await a.move(start);
  const from = a.rect("dock");
  await a.drag(end, (point) => {
    a.put({ drag: Math.min(2, Math.max(0, (point.x - from.x - from.width * 0.135) / (from.width * 0.2425))) });
  }, { duration: 640, path: (t, p, q) => ({ x: p.x + (q.x - p.x) * t, y: p.y }) });
  await a.set({ index: 2, drag: null });
  a.mark("selected");
  await a.move({ at: "dock", x: 0.86, y: 1.24 });
  await a.wait(520);
  await a.click(start);
  await a.set({ index: 0 });
  await a.move(cursor.at);
}

async function copyNote(a: Act<{ copied: boolean }>) {
  a.mark("ready");
  await a.wait(600);
  await a.click("copy");
  await a.set({ copied: true });
  a.mark("copied");
  await a.move({ at: "copy", x: 1.5, y: 1.3 });
  await a.wait(1450);
  await a.set({ copied: false });
  await a.move(cursor.at);
}

async function turnPage(a: Act<{ turn: number }>) {
  a.mark("ready");
  await a.wait(880);
  await a.move("corner");
  const book = a.rect("book");
  await a.drag({ x: book.x + 16, y: book.y + book.height - 18 }, (_point, _from, progress) => {
    a.put({ turn: progress });
  }, { duration: 820 });
  await a.set({ turn: 1 });
  a.mark("turned");
  await a.wait(720);
  await a.move("reverse-corner");
  await a.drag({ x: book.x + book.width - 16, y: book.y + book.height - 18 }, (_point, _from, progress) => {
    a.put({ turn: 1 - progress });
  }, { duration: 720 });
  await a.set({ turn: 0 });
  await a.move(cursor.at);
}

export function ReleaseScene({ slug }: { slug: ReleasePreview["slug"] }) {
  const narrow = { width: 304, height: 132, play: "loop" as const, cursor };
  switch (slug) {
    case "dock-transition":
      return (
        <Stage
          width={640}
          height={264}
          compact={{ below: 480, width: 342, height: 200 }}
          fill
          play="loop"
          cursor={heroCursor}
          initial={{ compact: false }}
          poster={{ compact: true }}
          script={contractDock}
        >
          {({ compact }) => (
            <div className={styles.hero} data-compact={compact}>
              <Image src="/images/writing/what-a-transition-is-for.png" alt="" fill sizes="640px" priority />
              <span className={styles.storyTarget} data-target="story" data-cursor="hand" />
              <div className={styles.heroDock} data-target="hero-dock" data-cursor="hand">
                <DynamicDock tabs={tabs} activeIndex={0} detail={compact} onSelect={noAction} onBack={noAction} onHome={noAction} />
              </div>
            </div>
          )}
        </Stage>
      );
    case "dynamic-dock":
      return (
        <Stage<{ index: number; drag: number | null }>
          {...narrow}
          fill
          initial={{ index: 0, drag: null }}
          poster={{ index: 2, drag: null }}
          script={slideDock}
        >
          {({ index, drag }) => (
            <div className={styles.dockScene}>
              <div
                className={styles.dragDock}
                data-target="dock"
                data-cursor="open"
                style={drag === null ? undefined : { "--dock-drag-x": `${drag * 100}%`, "--dock-pill-slide-dur": "0s" } as CSSProperties}
              >
                <DynamicDock tabs={tabs} activeIndex={index} detail={false} onSelect={noAction} onBack={noAction} />
              </div>
            </div>
          )}
        </Stage>
      );
    case "notes":
      return (
        <Stage {...narrow} fill initial={{ copied: false }} poster={{ copied: true }} script={copyNote}>
          {({ copied }) => (
            <div className={styles.notesScene}>
              <SiteSquircle className={`notes ${styles.note}`}>
                <div className="notes-band">
                  <span className={styles.noteRule} />
                  <span className="notes-copy" data-target="copy" data-cursor="hand">
                    <span className="icon-swap" data-state={copied ? "b" : "a"}>
                      <Copy data-icon="a" />
                      <Check data-icon="b" />
                    </span>
                  </span>
                </div>
                <div className="notes-perforation" />
                <div className={`notes-body ${styles.noteBody}`} />
              </SiteSquircle>
            </div>
          )}
        </Stage>
      );
    case "flipbook":
      return (
        <Stage {...narrow} fill initial={{ turn: 0 }} poster={{ turn: 0 }} script={turnPage}>
          {({ turn }) => (
            <div className={styles.bookScene}>
              <div className={styles.book} data-target="book" style={{ "--page-turn": `${turn * -180}deg` } as CSSProperties}>
                <div className={styles.bookLeft}><span className={styles.circle} /></div>
                <div className={styles.bookRight}><span className={styles.bookPattern} /></div>
                <div className={styles.leaf}>
                  <div className={styles.leafFront}>
                    <span className={styles.semicircle} />
                    <span className={styles.corner} data-target="corner" data-cursor="open" />
                  </div>
                  <div className={styles.leafBack}>
                    <span className={styles.ellipse} />
                    <span className={styles.corner} data-target="reverse-corner" data-cursor="open" />
                  </div>
                </div>
                <div className={styles.spine} />
              </div>
            </div>
          )}
        </Stage>
      );
    case "pull-card-transition":
      return <PullCardScene />;
  }
}
