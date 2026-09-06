import Image from "next/image";
import Link from "next/link";

export type GalleryEntry = {
  caption: string;
  projectName: string;
  image?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Set when the entry points at a case study that has a page. */
  href?: string;
};

function Figure({ entry }: { entry: GalleryEntry }) {
  return (
    <>
      {entry.image ? (
        <Image
          src={entry.image}
          alt={entry.alt ?? ""}
          width={entry.width ?? 500}
          height={entry.height ?? 300}
          className="h-auto w-full"
        />
      ) : (
        <div className="bg-line aspect-[5/3] w-full" />
      )}
      {/* Only the caption dims. The lens refracts a frozen capture of the
          page, so an image that changes opacity under the pointer stops
          matching its own refraction and the strip reads as a seam. */}
      <figcaption className="pt-3 group-hover:opacity-60">
        <span className="block">{entry.caption}</span>
        <span className="text-muted block">{entry.projectName}</span>
      </figcaption>
    </>
  );
}

export function GalleryList({ entries }: { entries: GalleryEntry[] }) {
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <figure key={`${entry.caption}-${i}`}>
          {entry.href ? (
            // the image and its caption are one target; the caption carries
            // the hover on its own — the same restraint as a list row. Only
            // this linked branch presses: an entry with no case study behind
            // it is not a target, so it must not answer a tap like one.
            <Link
              href={entry.href}
              className="press-shrink group block no-underline"
            >
              <Figure entry={entry} />
            </Link>
          ) : (
            <Figure entry={entry} />
          )}
        </figure>
      ))}
    </div>
  );
}
