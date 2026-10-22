"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { FunVideo } from "@/components/fun/FunVideo";
import type { FunPiece } from "@/lib/content";
import { FUN_CATEGORIES, type FunCategory } from "@/lib/fun-categories";

/**
 * How tall a caption is, as a share of the column's width: two 21px lines
 * and the 12px above them, plus the gap to the next tile. Only used to deal
 * tiles into columns, so it needs to be near, not exact.
 */
const CAPTION = { 3: 0.26, 2: 0.6 } as const;

/** How many of a set's further images sit behind its tile. */
const STACK = 2;

/** The 16px a stack's peek adds above its cover, as a share of the column. */
const STACK_ROOM = { 3: 0.05, 2: 0.1 } as const;

/**
 * Masonry that still reads left to right, newest first: each tile goes to
 * whichever column is shortest so far. CSS columns would read top to bottom.
 */
function deal(pieces: FunPiece[], count: 2 | 3): FunPiece[][] {
  const columns: FunPiece[][] = Array.from({ length: count }, () => []);
  const heights = new Array<number>(count).fill(0);
  for (const piece of pieces) {
    const ratio = piece.image ? piece.image.height / piece.image.width : 0.75;
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(piece);
    heights[shortest] +=
      ratio + CAPTION[count] + (piece.more.length ? STACK_ROOM[count] : 0);
  }
  return columns;
}

function Tile({ piece }: { piece: FunPiece }) {
  const { image } = piece;
  const stack = piece.more.slice(0, STACK);
  return (
    <Link
      href={`/fun/${piece.slug}`}
      className="fun-tile press-shrink group block no-underline"
      data-cursor="View"
      // Travels into the piece's page (components/effects/ThumbnailMorph.tsx).
      data-morph={`fun:${piece.slug}`}
    >
      <figure>
        {/* A set is a stack: its next pictures peek out behind the cover and
            fan out under the pointer. The cover comes first in the markup, so
            it is the one the morph carries into the piece's page. */}
        <div className="fun-stack" data-stack={stack.length || undefined}>
          {piece.video ? (
            <FunVideo
              src={piece.video}
              poster={image?.src}
              width={image?.width}
              height={image?.height}
              aria-label={image?.alt || piece.title}
              className="block h-auto w-full"
            />
          ) : image ? (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1248px) 384px, (min-width: 688px) 33vw, calc(50vw - 32px)"
              className="block h-auto w-full"
            />
          ) : (
            <div className="bg-line aspect-[4/3] w-full" />
          )}
          {stack.map((m, i) => (
            <Image
              key={m.src}
              src={m.src}
              alt=""
              fill
              sizes="(min-width: 1248px) 384px, (min-width: 688px) 33vw, calc(50vw - 32px)"
              className="fun-stack-card"
              data-depth={i + 1}
            />
          ))}
        </div>
        {/* As on the Home gallery, only the caption dims. */}
        <figcaption className="pt-3 group-hover:opacity-60">
          <span className="block">{piece.title}</span>
          <span className="text-muted block">{piece.subtitle}</span>
        </figcaption>
      </figure>
    </Link>
  );
}

function Wall({
  pieces,
  category,
}: {
  pieces: FunPiece[];
  category: FunCategory | null;
}) {
  const shown = useMemo(
    () => (category ? pieces.filter((p) => p.category === category) : pieces),
    [pieces, category],
  );
  const three = useMemo(() => deal(shown, 3), [shown]);
  const two = useMemo(() => deal(shown, 2), [shown]);

  // A filter appears only once it has something to find, and the row only
  // once there is more than one to choose between.
  const inUse = FUN_CATEGORIES.filter((c) =>
    pieces.some((p) => p.category === c.value),
  );

  const columns = (sets: FunPiece[][]) =>
    sets.map((column, i) => (
      <div key={i} className="flex min-w-0 flex-1 flex-col gap-4 column:gap-6">
        {column.map((piece) => (
          <Tile key={piece.slug} piece={piece} />
        ))}
      </div>
    ));

  return (
    <>
      {inUse.length > 1 && (
        <nav aria-label="Filter" className="fun-filters">
          {[{ value: null, label: "All" }, ...inUse].map((c) => {
            const active = c.value === category;
            return (
              <Link
                key={c.label}
                href={c.value ? `/fun?c=${c.value}` : "/fun"}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={active ? "no-underline" : "text-muted no-underline hover:text-fg"}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>
      )}

      {pieces.length === 0 ? (
        <p className="text-muted">Nothing here yet.</p>
      ) : (
        <div className="fun-wall">
          {/* Both layouts are sent and one is display: none at each width, so
              the first paint is already right. A hidden copy is out of the
              accessibility tree and its lazy images never load. */}
          <div className="hidden gap-6 column:flex">{columns(three)}</div>
          <div className="flex gap-4 column:hidden">{columns(two)}</div>
        </div>
      )}
    </>
  );
}

function FilteredWall({ pieces }: { pieces: FunPiece[] }) {
  const c = useSearchParams().get("c");
  const category = FUN_CATEGORIES.some((x) => x.value === c)
    ? (c as FunCategory)
    : null;
  return <Wall pieces={pieces} category={category} />;
}

/**
 * The Fun tab: a masonry wall of side work, filtered by `?c=`. The page is
 * static, so the server sends All and the filter applies once the browser
 * can read the address. See doc/fun-tab-plan.md.
 */
export function FunWall({ pieces }: { pieces: FunPiece[] }) {
  return (
    <Suspense fallback={<Wall pieces={pieces} category={null} />}>
      <FilteredWall pieces={pieces} />
    </Suspense>
  );
}
