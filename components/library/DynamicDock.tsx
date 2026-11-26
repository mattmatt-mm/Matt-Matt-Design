"use client";

import type { Icon } from "@phosphor-icons/react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import type { CSSProperties } from "react";
import { useDockDrag } from "./useDockDrag";
import styles from "./DynamicDock.module.css";

export function DynamicDock({ tabs, activeIndex, detail, onSelect, onBack, className, label = "Navigation" }: {
  tabs: readonly { label: string; icon: Icon }[];
  activeIndex: number;
  detail: boolean;
  onSelect: (index: number) => void;
  onBack: () => void;
  className?: string;
  label?: string;
}) {
  const { pillRef, dragHandlers } = useDockDrag(tabs.length, activeIndex, detail, activeIndex, onSelect);

  return (
    <div className={className ? `${styles.row} ${className}` : styles.row} data-detail={detail} style={{
      "--dock-count": tabs.length,
      "--dock-active": activeIndex,
    } as CSSProperties}>
      <nav className={styles.dock} aria-label={label} {...dragHandlers}>
        <div ref={pillRef} className={styles.pill} aria-hidden />
        <button type="button" className={styles.back} inert={!detail} onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} aria-hidden />
        </button>
        {tabs.map(({ label, icon: TabIcon }, index) => (
          <button
            key={label}
            type="button"
            className={styles.tab}
            inert={detail}
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
