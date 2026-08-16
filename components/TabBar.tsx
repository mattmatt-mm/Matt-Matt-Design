"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Experience" },
  { href: "/gallery", label: "Gallery" },
  { href: "/writing", label: "Writing" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="border-line flex gap-2 border-b pt-3 pb-3">
      {tabs.map((tab) => {
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            /* The 2px marker sits at the nav's bottom edge, covering the 1px
               hairline — matching the export, where they share a top edge. */
            className={`relative px-1 no-underline ${
              active
                ? "text-fg after:bg-fg after:absolute after:inset-x-0 after:bottom-[-14px] after:h-[2px]"
                : "text-muted hover:text-fg"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
