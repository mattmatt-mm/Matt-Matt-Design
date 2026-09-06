"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type CSSProperties, type Ref, useEffect, useRef, useState } from "react";
import { CloudAvatar } from "@/components/ai/CloudAvatar";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";

const tabs = [
  { href: "/", label: "Experience", icon: UserCircle },
  { href: "/gallery", label: "Gallery", icon: ImageSquare },
  { href: "/writing", label: "Writing", icon: PenNib },
];

const TAP_VOLUME = 0.5;


export function AiDock({
  aiOpen,
  expression,
  onOpen,
  onNavigate,
  triggerRef,
}: {
  aiOpen: boolean;
  expression: BloubExpressionId;
  onOpen: () => void;
  onNavigate: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const pathname = usePathname();
  const [tapped, setTapped] = useState<{ href: string; plays: number } | null>(null);
  const tapSound = useRef<HTMLAudioElement | null>(null);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/" || pathname.startsWith("/work/")
      : pathname.startsWith(href);

  // The pill slides to this column. Resolved during render, so the server sends
  // it already in place — there is no first-paint snap to suppress.
  const activeIndex = tabs.findIndex((tab) => isActive(tab.href));

  useEffect(() => {
    const audio = new Audio("/sounds/tap.wav");
    audio.preload = "auto";
    audio.volume = TAP_VOLUME;
    tapSound.current = audio;
    return () => {
      tapSound.current = null;
    };
  }, []);

  function tap(href: string) {
    const audio = tapSound.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }
    setTapped((previous) => ({
      href,
      plays: (previous?.href === href ? previous.plays : 0) + 1,
    }));
    onNavigate();
  }

  return (
    <>
      <div
        className="site-content-mask"
        data-ai-open={aiOpen ? "true" : "false"}
        aria-hidden="true"
      />
      <div
        className="site-dock-row"
        data-ai-open={aiOpen ? "true" : "false"}
        style={
          {
            "--dock-count": tabs.length,
            "--dock-active": Math.max(activeIndex, 0),
          } as CSSProperties
        }
      >
        <div className="site-dock-shadow">
          {/* Capsules, so no squircle: at radius = half the height there is no
              corner left to smooth, and a clip path would disagree with the
              border-radius the inset rim and bevel are drawn against. */}
          <nav
            className="site-dock navigation-surface"
            aria-label="Portfolio sections"
            data-has-active={activeIndex === -1 ? "false" : "true"}
          >
            {/* One pill for the whole bar, not a surface per tab: it travels
                between columns so the recess slides rather than jumps. */}
            <div className="site-dock-pill" aria-hidden="true" />
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              const Icon = tab.icon;
              const hopping = tapped?.href === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  aria-hidden={aiOpen ? "true" : undefined}
                  tabIndex={aiOpen ? -1 : undefined}
                  className="site-dock-tab"
                  data-active={active ? "true" : "false"}
                  onClick={() => tap(tab.href)}
                >
                  {/* The tap hop used to run letter by letter across the label.
                      With the label gone the icon carries it, so a tap still
                      answers in the same voice. Remounting on `plays` restarts
                      the animation for repeated taps. */}
                  <span
                    key={hopping ? tapped?.plays : 0}
                    className={hopping ? "site-dock-icon tab-hop" : "site-dock-icon"}
                    aria-hidden="true"
                  >
                    <Icon size={20} weight="regular" />
                  </span>
                  <span className="sr-only">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="ai-trigger-shell">
          {/* A true circle, so no squircle: at radius = half the width there is
              no corner left to smooth. */}
          <div className="ai-trigger-surface navigation-surface" aria-hidden="true" />
          <button
            ref={triggerRef}
            type="button"
            className="ai-trigger"
            aria-label="Ask Matt's AI"
            aria-hidden={aiOpen ? "true" : undefined}
            tabIndex={aiOpen ? -1 : 0}
            disabled={aiOpen}
            onClick={onOpen}
          >
            <CloudAvatar expression={expression} />
          </button>
        </div>
      </div>
    </>
  );
}
