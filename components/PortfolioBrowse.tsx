"use client";

import type { Icon } from "@phosphor-icons/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { CaretRight } from "@phosphor-icons/react/dist/ssr/CaretRight";
import { ChatCircleDots } from "@phosphor-icons/react/dist/ssr/ChatCircleDots";
import { Code } from "@phosphor-icons/react/dist/ssr/Code";
import { Compass } from "@phosphor-icons/react/dist/ssr/Compass";
import { Gear } from "@phosphor-icons/react/dist/ssr/Gear";
import { ImagesSquare } from "@phosphor-icons/react/dist/ssr/ImagesSquare";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { Scroll } from "@phosphor-icons/react/dist/ssr/Scroll";
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
import { SiteSquircle } from "@/components/SiteSquircle";
import { componentsPath } from "@/lib/component-library";
import type { PortfolioSearchEntry } from "@/lib/content";
import { profilePath, profileTitle, releasesPath } from "@/lib/site";

type Shortcut = {
  title: string;
  tone: string;
  icon: Icon;
} & ({ href: string } | { action: PortfolioAction });

const featuredShortcuts = [
  { href: profilePath, title: profileTitle, icon: UserCircle, tone: "peach" },
  { href: componentsPath, title: "Components", icon: Code, tone: "teal" },
];

const shortcutGroups: { label: string; items: Shortcut[] }[] = [
  {
    label: "Portfolio shortcuts",
    items: [
      { href: "/", title: "Selected work", icon: ImagesSquare, tone: "blue" },
      { href: "/writing", title: "Writing", icon: PenNib, tone: "gold" },
      { href: "/fun", title: "Fun", icon: Sparkle, tone: "violet" },
    ],
  },
  {
    label: "AI actions",
    items: [
      { action: "chat", title: "Ask Matt’s AI", icon: ChatCircleDots, tone: "neutral" },
      { action: "walkthrough", title: GUIDED_WALKTHROUGH_LABEL, icon: Compass, tone: "teal" },
    ],
  },
  {
    label: "Site shortcuts",
    items: [
      { href: "/browse/settings", title: "Settings", icon: Gear, tone: "neutral" },
      { href: releasesPath, title: "Releases", icon: Scroll, tone: "neutral" },
    ],
  },
];

function searchText(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ShortcutContents({ title, icon: Icon }: Shortcut) {
  return (
    <>
      <SiteSquircle asChild cornerRadius={8}>
        <span className="browse-shortcut-icon" aria-hidden="true">
          <Icon size={20} weight="duotone" />
        </span>
      </SiteSquircle>
      <span className="browse-shortcut-label">{title}</span>
      <CaretRight size={16} aria-hidden="true" />
    </>
  );
}

function BrowseShortcuts() {
  const openAction = useContext(PortfolioActions);

  return (
    <div className="browse-shortcuts">
      <ul className="browse-featured" role="list" aria-label="Featured shortcuts">
        {featuredShortcuts.map((shortcut) => (
          <SiteSquircle asChild key={shortcut.href}>
            <li className="browse-featured-card">
              <Link href={shortcut.href} data-tone={shortcut.tone} className="browse-shortcut press-shrink">
                <ShortcutContents {...shortcut} />
              </Link>
            </li>
          </SiteSquircle>
        ))}
      </ul>
      {shortcutGroups.map(({ label, items }) => (
        <SiteSquircle asChild key={label}>
          <ul className="browse-shortcut-group" role="list" aria-label={label}>
            {items.map((shortcut) => (
              <li key={shortcut.title}>
                {"href" in shortcut ? (
                  <Link
                    href={shortcut.href}
                    data-tone={shortcut.tone}
                    className="browse-shortcut press-shrink"
                  >
                    <ShortcutContents {...shortcut} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    data-tone={shortcut.tone}
                    className="browse-shortcut press-shrink"
                    onClick={(event) => openAction?.(shortcut.action, event.currentTarget)}
                  >
                    <ShortcutContents {...shortcut} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </SiteSquircle>
      ))}
    </div>
  );
}

export function PortfolioBrowse({ entries }: { entries: PortfolioSearchEntry[] }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
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
        <BrowseShortcuts />
      )}
    </>
  );
}
