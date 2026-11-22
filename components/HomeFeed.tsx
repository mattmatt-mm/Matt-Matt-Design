"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useContext } from "react";
import { PortfolioActions } from "@/components/ai/PortfolioActions";
import { GalleryList, type GalleryEntry } from "@/components/GalleryList";
import { parseFocus, type Discipline } from "@/lib/disciplines";

type FeedProps = { entries: GalleryEntry[]; email: string };

function matchingEntries(entries: GalleryEntry[], picks: Discipline[]) {
  return picks.length
    ? entries.filter((entry) => entry.disciplines.some((tag) => picks.includes(tag)))
    : entries;
}

function resultLabel(shown: number, total: number) {
  return `Showing ${shown} of ${total} gallery items`;
}

function FeedView({
  entries,
  email,
  selected,
}: FeedProps & {
  selected: Discipline[];
}) {
  const openAction = useContext(PortfolioActions);
  const shown = matchingEntries(entries, selected);

  return (
    <>
      <div className="home-feed-actions">
        <button
          type="button"
          className="home-feed-action press-shrink"
          disabled={!openAction}
          onClick={(event) => openAction?.("walkthrough", event.currentTarget)}
        >
          Customise feed
        </button>
        <a
          className="home-feed-action home-feed-primary press-shrink"
          href={`mailto:${email}`}
        >
          Let’s work
        </a>
      </div>

      <div className="mt-15 pt-3">
        <p
          className={selected.length ? "text-muted-readable mb-3" : "sr-only"}
          role="status"
        >
          {selected.length ? resultLabel(shown.length, entries.length) : ""}
        </p>
        {shown.length > 0 ? <GalleryList entries={shown} /> : <p>No matching work.</p>}
      </div>
    </>
  );
}

function FilteredFeed(props: FeedProps) {
  const searchParams = useSearchParams();
  // Existing links to a filtered Home still show their saved selection.
  const selected = parseFocus(searchParams.get("feed") ?? "") ?? [];
  return <FeedView {...props} selected={selected} />;
}

export function HomeFeed(props: FeedProps) {
  return (
    <Suspense fallback={<FeedView {...props} selected={[]} />}>
      <FilteredFeed {...props} />
    </Suspense>
  );
}
