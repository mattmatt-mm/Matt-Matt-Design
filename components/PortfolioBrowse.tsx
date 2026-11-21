"use client";

import type { Icon } from "@phosphor-icons/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr/ChatCircleDots";
import { Compass } from "@phosphor-icons/react/dist/ssr/Compass";
import { ImagesSquare } from "@phosphor-icons/react/dist/ssr/ImagesSquare";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import Link from "next/link";
import { useContext, useMemo, useRef, useState } from "react";
import {
  GUIDED_WALKTHROUGH_LABEL,
  PortfolioActions,
  type PortfolioAction,
} from "@/components/ai/PortfolioActions";
import type { PortfolioSearchEntry } from "@/lib/content";
import { profileTitle } from "@/lib/site";

type Shortcut = {
  title: string;
  tone: string;
  icon: Icon;
} & ({ href: string } | { action: PortfolioAction });

const shortcuts: Shortcut[] = [
  { href: "/", title: "Selected work", icon: ImagesSquare, tone: "blue" },
  { href: "/profile", title: profileTitle, icon: UserCircle, tone: "peach" },
  { href: "/writing", title: "Writing", icon: PenNib, tone: "gold" },
  { href: "/fun", title: "Fun", icon: Sparkle, tone: "violet" },
  { action: "chat", title: "Ask Matt’s AI", icon: ChatCircleDots, tone: "neutral" },
  { action: "walkthrough", title: GUIDED_WALKTHROUGH_LABEL, icon: Compass, tone: "teal" },
];

function searchText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function PortfolioBrowse({ entries }: { entries: PortfolioSearchEntry[] }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const openAction = useContext(PortfolioActions);
  const normalized = searchText(query);
  const index = useMemo(
    () => entries.map((entry) => ({
      ...entry,
      name: searchText(entry.title),
      text: searchText(`${entry.title} ${entry.kind} ${entry.keywords} ${entry.href}`),
    })),
    [entries],
  );

  const words = normalized.split(" ");
  const results = normalized
    ? index
        .filter((entry) => words.every((word) => entry.text.includes(word)))
        .sort((a, b) => Number(b.name.startsWith(normalized)) - Number(a.name.startsWith(normalized)))
    : [];

  return (
    <>
      <div className="browse-search navigation-surface" role="search">
        <MagnifyingGlass aria-hidden="true" size={20} />
        <input
          ref={input}
          type="search"
          aria-label="Search the portfolio"
          placeholder="Search portfolio"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button
            type="button"
            className="browse-search-clear press-shrink"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              input.current?.focus();
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <p className="sr-only" role="status">
        {normalized ? `${results.length} search results` : ""}
      </p>
      {normalized ? (
        results.length ? (
          <ul className="browse-results" aria-label="Search results">
            {results.map((entry) => (
              <li key={entry.href}>
                <Link href={entry.href} prefetch={false} className="browse-result press-shrink">
                  <span>{entry.title}</span>
                  <span className="browse-result-kind">{entry.kind}</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="browse-empty">No matches. Try another name or topic.</p>
        )
      ) : (
        <ul className="browse-grid" aria-label="Portfolio shortcuts">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            const contents = (
              <>
                <span className="browse-card-icon" aria-hidden="true">
                  <Icon size={22} weight="duotone" />
                </span>
                <ArrowRight className="browse-card-arrow" size={16} aria-hidden="true" />
                <span className="browse-card-label">{shortcut.title}</span>
              </>
            );

            return (
              <li key={shortcut.title}>
                {"href" in shortcut ? (
                  <Link href={shortcut.href} data-tone={shortcut.tone} className="browse-card press-shrink">
                    {contents}
                  </Link>
                ) : (
                  <button
                    type="button"
                    data-tone={shortcut.tone}
                    className="browse-card press-shrink"
                    onClick={(event) => openAction?.(shortcut.action, event.currentTarget)}
                  >
                    {contents}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
