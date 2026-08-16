import Image from "next/image";

export type GalleryEntry = {
  caption: string;
  projectName: string;
  image?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export function GalleryList({ entries }: { entries: GalleryEntry[] }) {
  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, i) => (
        <figure key={`${entry.caption}-${i}`}>
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
        </figure>
      ))}
    </div>
  );
}
