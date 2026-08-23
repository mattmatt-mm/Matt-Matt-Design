"use client";

import { ImageSquare } from "@phosphor-icons/react/dist/ssr/ImageSquare";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Ref, useEffect, useRef, useState } from "react";
import { SiteSquircle } from "@/components/SiteSquircle";
import { CloudAvatar } from "@/components/ai/CloudAvatar";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";

const tabs = [
  { href: "/", label: "Experience", icon: UserCircle },
  { href: "/gallery", label: "Gallery", icon: ImageSquare },
  { href: "/writing", label: "Writing", icon: PenNib },
];

const WORD_MS = 480;
const LETTER_MS = 240;
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
      <div className="site-dock-row" data-ai-open={aiOpen ? "true" : "false"}>
        <div className="site-dock-shadow">
          <SiteSquircle asChild>
            <nav
              className="site-dock navigation-surface"
              aria-label="Portfolio sections"
            >
              {tabs.map((tab) => {
                const active =
                  tab.href === "/"
                    ? pathname === "/" || pathname.startsWith("/work/")
                    : pathname.startsWith(tab.href);
                const Icon = tab.icon;
                const letters = [...tab.label];
                const step =
                  letters.length > 1
                    ? (WORD_MS - LETTER_MS) / (letters.length - 1)
                    : 0;
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
                    <SiteSquircle
                      cornerRadius={12}
                      className="site-dock-tab-surface"
                      aria-hidden="true"
                    />
                    <Icon size={20} weight="regular" aria-hidden="true" />
                    <span aria-hidden="true">
                      {letters.map((letter, index) => (
                        <span
                          key={`${hopping ? tapped?.plays : 0}-${index}`}
                          className={hopping ? "tab-letter" : undefined}
                          style={
                            hopping
                              ? {
                                  animationDelay: `${Math.round(index * step)}ms`,
                                }
                              : undefined
                          }
                        >
                          {letter}
                        </span>
                      ))}
                    </span>
                    <span className="sr-only">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SiteSquircle>
        </div>
        <div className="ai-trigger-shell">
          <SiteSquircle
            width={52}
            height={52}
            className="ai-trigger-surface navigation-surface"
            aria-hidden="true"
          />
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
