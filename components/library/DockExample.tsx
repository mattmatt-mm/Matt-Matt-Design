"use client";

import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { useState } from "react";
import { DynamicDock } from "./DynamicDock";
import styles from "./Library.module.css";

const tabs = [
  { label: "Home", icon: House },
  { label: "Writing", icon: PenNib },
  { label: "Fun", icon: Sparkle },
  { label: "Browse", icon: MagnifyingGlass },
];

export function DockExample() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [detail, setDetail] = useState(false);

  function goHome() {
    setActiveIndex(0);
    setDetail(false);
  }

  return (
    <div className={styles.dockExample}>
      <p className="text-title" aria-live="polite">{detail ? `${tabs[activeIndex].label} detail` : tabs[activeIndex].label}</p>
      <button type="button" className={`${styles.action} press-shrink`} onClick={() => setDetail(true)} disabled={detail}>
        Open detail
      </button>
      <DynamicDock tabs={tabs} activeIndex={activeIndex} detail={detail} onSelect={setActiveIndex} onBack={() => setDetail(false)} onHome={goHome} className={styles.demoDock} label="Demo dock" />
    </div>
  );
}
