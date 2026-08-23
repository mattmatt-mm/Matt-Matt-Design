import Link from "next/link";
import { Signature } from "@/components/Signature";

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
      {/* Optical alignment, not layout spacing: 5px lands the signature's
          opening stroke on the name's x-height. Exempt from the 4px grid. */}
      <Signature className="mt-[5px] shrink-0" />
    </header>
  );
}
