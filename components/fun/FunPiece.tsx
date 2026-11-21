import Image from "next/image";
import type { CSSProperties } from "react";
import { FunVideo } from "@/components/fun/FunVideo";
import { Photobook } from "@/components/photobook/Photobook";
import type { FunMedia, FunPiece as Piece } from "@/lib/content";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "16 July 2026", read from YYYY-MM-DD without a Date, so no timezone moves it. */
function longDate(date: string) {
  const [year, month, day] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  return year && name && day ? `${Number(day)} ${name} ${year}` : "";
}

/**
 * One Fun piece on its own page: its colours on the left, the work in the
 * middle, the file's details on the right, after a file inspector Matt
 * shared on 2026-10-23. The tile's picture travels in from the wall
 * (`data-fun-hero` is where it lands). See doc/fun-tab-plan.md.
 */
export function FunPiece({ piece, bookPages }: { piece: Piece; bookPages: FunMedia[] }) {
  const { image } = piece;
  const cover = bookPages[0];
  const hero = cover ?? image;
  const external = piece.href?.startsWith("http");
  const details = [
    hero && { label: "Resolution", value: `${hero.width} × ${hero.height}` },
    piece.date && { label: "Date", value: longDate(piece.date) },
    piece.tools && { label: "Tools", value: piece.tools },
  ].filter((d): d is { label: string; value: string } => Boolean(d));

  return (
    <article
      className="fun-piece"
      data-photobook={cover ? "" : undefined}
      style={
        {
          "--fun-w": hero?.width ?? 1200,
          "--fun-ratio": hero ? hero.width / hero.height : 4 / 3,
        } as CSSProperties
      }
    >
      <div className="fun-piece-hero" data-fun-hero={piece.slug}>
        {cover ? (
          <Photobook id="photobook" pages={bookPages} />
        ) : piece.video ? (
          <FunVideo
            src={piece.video}
            poster={image?.src}
            width={image?.width}
            height={image?.height}
            preload="auto"
            aria-label={image?.alt || piece.title}
            className="block h-auto w-full"
          />
        ) : image ? (
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 1104px) 640px, 100vw"
            priority
            className="block h-auto w-full"
          />
        ) : (
          <div className="bg-line aspect-[4/3] w-full" />
        )}
      </div>

      {piece.palette.length > 0 && (
        <ul className="fun-piece-palette" aria-label="Colours">
          {piece.palette.map((hex) => (
            <li
              key={hex}
              className="fun-piece-swatch"
              // A colour from the content, not a design token.
              style={{ backgroundColor: hex }}
              title={hex}
            >
              <span className="sr-only">{hex}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="fun-piece-details">
        <div>
          <h1 className="text-section font-bold">{piece.title}</h1>
          {piece.subtitle ? <p className="text-muted">{piece.subtitle}</p> : null}
        </div>
        {details.length > 0 && (
          <dl className="flex flex-col gap-4">
            {details.map((d) => (
              <div key={d.label}>
                <dt>{d.label}</dt>
                <dd className="text-muted">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {piece.href && (
          <a
            href={piece.href}
            data-cursor={external ? "View website" : "View project"}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="self-start"
          >
            {external ? "View website" : "View project"}
          </a>
        )}
      </div>

      {piece.more.length > 0 && (
        <div className="fun-piece-more">
          {piece.more.map((m) => (
            <Image
              key={m.src}
              src={m.src}
              alt={m.alt}
              width={m.width}
              height={m.height}
              sizes="(min-width: 1104px) 640px, 100vw"
              className="block h-auto w-full"
            />
          ))}
        </div>
      )}
    </article>
  );
}
