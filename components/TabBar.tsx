"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const tabs = [
  { href: "/", label: "Experience" },
  { href: "/writing", label: "Writing" },
];

/** The whole word finishes in 0.48s, whatever its length. */
const WORD_MS = 480;
const LETTER_MS = 240;

/** Raise or lower the tap sound here. 0 silences it. */
const TAP_VOLUME = 0.5;

export function TabBar() {
  const pathname = usePathname();
  // `plays` increments per tap so the letters remount and the hop replays.
  const [tapped, setTapped] = useState<{ href: string; plays: number } | null>(
    null,
  );
  const tapSound = useRef<HTMLAudioElement | null>(null);

  // Built once on the client so the first tap is not the one that waits for
  // the download.
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
      // rewind so quick successive taps each sound, rather than being swallowed
      audio.currentTime = 0;
      // a blocked or interrupted play must never break navigation
      void audio.play().catch(() => {});
    }

    setTapped((prev) => ({
      href,
      plays: (prev?.href === href ? prev.plays : 0) + 1,
    }));
  }

  return (
    <nav className="border-line flex gap-2 border-b pt-3 pb-3">
      {tabs.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

        const letters = [...tab.label];
        // stagger fills whatever time one letter's hop leaves over
        const step =
          letters.length > 1 ? (WORD_MS - LETTER_MS) / (letters.length - 1) : 0;
        const hopping = tapped?.href === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            onClick={() => tap(tab.href)}
            /* The 2px marker straddles the hairline: 1px above it, 1px over it. */
            className={`relative px-1 no-underline ${
              active
                ? "text-fg after:bg-fg after:absolute after:inset-x-0 after:bottom-[-13px] after:h-[2px]"
                : "text-muted hover:text-fg"
            }`}
          >
            {/* Letters are split for the hop, so the word is exposed to
                assistive tech once, intact, rather than character by character. */}
            <span aria-hidden="true">
              {letters.map((letter, i) => (
                <span
                  key={`${hopping ? tapped.plays : 0}-${i}`}
                  className={hopping ? "tab-letter" : undefined}
                  style={
                    hopping
                      ? { animationDelay: `${Math.round(i * step)}ms` }
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
  );
}
