import Image from "next/image";
import Link from "next/link";

export function Header({
  name,
  role,
  href,
}: {
  name: string;
  role: string;
  /** Set on detail pages to turn the name into the way back home. */
  href?: string;
}) {
  return (
    <header className="flex items-start justify-between">
      <div>
        <p>
          {href ? (
            <Link href={href} className="no-underline hover:opacity-60">
              {name}
            </Link>
          ) : (
            name
          )}
        </p>
        <p className="text-muted">{role}</p>
      </div>
      {/* Optical alignment, not layout spacing: the artwork carries 3.3px of
          internal top bearing, and 5px lands its ink on the name's x-height,
          which is where the export places it. Exempt from the 4px grid. */}
      <Image
        src="/signature.svg"
        alt=""
        width={101}
        height={32}
        priority
        className="mt-[5px] shrink-0"
      />
    </header>
  );
}
