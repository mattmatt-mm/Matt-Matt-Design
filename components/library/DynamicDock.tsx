"use client";

import type { Icon } from "@phosphor-icons/react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import type { CSSProperties } from "react";
import { useDockDrag } from "./useDockDrag";
import styles from "./DynamicDock.module.css";

export function DynamicDock({ tabs, activeIndex, detail, onSelect, onBack, onHome, className, label = "Navigation" }: {
  tabs: readonly { label: string; icon: Icon }[];
  activeIndex: number;
  detail: boolean;
  onSelect: (index: number) => void;
  onBack: () => void;
  onHome?: () => void;
  className?: string;
  label?: string;
}) {
  const { pillRef, dragHandlers } = useDockDrag(tabs.length, activeIndex, detail, activeIndex, onSelect);

  return (
    <div className={className ? `${styles.row} ${className}` : styles.row} data-detail={detail} style={{
      "--dock-count": tabs.length,
      "--dock-active": activeIndex,
      "--dock-compact-count": onHome ? 2 : 1,
    } as CSSProperties}>
      <nav className={styles.dock} aria-label={label} {...dragHandlers}>
        <div ref={pillRef} className={styles.pill} aria-hidden />
        <div className={styles.compact} inert={!detail} aria-hidden={!detail || undefined}>
          <button type="button" className={styles.compactControl} onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} aria-hidden />
          </button>
          {onHome && (
            <button type="button" className={styles.compactControl} onClick={onHome} aria-label="Home">
              <House size={20} aria-hidden />
            </button>
          )}
        </div>
        {tabs.map(({ label, icon: TabIcon }, index) => (
          <button
            key={label}
            type="button"
            className={styles.tab}
            inert={detail}
            aria-hidden={detail || undefined}
            data-dock-tab=""
            data-active={activeIndex === index}
            aria-label={label}
            aria-current={activeIndex === index ? "page" : undefined}
            onClick={() => onSelect(index)}
          >
            <TabIcon size={20} aria-hidden />
          </button>
        ))}
      </nav>
    </div>
  );
}
