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
      <figcaption className="pt-3">
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
            // the image and its caption are one target, dimming together on
            // hover — the same restraint as a list row
            <Link
              href={entry.href}
              className="block no-underline hover:opacity-60"
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
