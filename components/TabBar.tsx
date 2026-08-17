"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const tabs = [
  { href: "/", label: "Experience" },
  { href: "/gallery", label: "Gallery" },
  { href: "/writing", label: "Writing" },
];

/** The whole word finishes in 0.48s, whatever its length. */
const WORD_MS = 480;
const LETTER_MS = 240;

export function TabBar() {
  const pathname = usePathname();
  // `plays` increments per tap so the letters remount and the hop replays.
  const [tapped, setTapped] = useState<{ href: string; plays: number } | null>(
    null,
  );

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
            onClick={() =>
              setTapped((prev) => ({
                href: tab.href,
                plays: (prev?.href === tab.href ? prev.plays : 0) + 1,
              }))
            }
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
                    hopping ? { animationDelay: `${Math.round(i * step)}ms` } : undefined
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
