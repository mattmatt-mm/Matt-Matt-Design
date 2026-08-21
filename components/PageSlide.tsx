"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

/** Left to right in the tab bar. The index is what decides the direction. */
const order = ["/", "/gallery", "/writing"];

function indexOf(pathname: string) {
  const i = order.findIndex((href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href),
  );
  return i === -1 ? 0 : i;
}

/**
 * Slides the incoming tab in from the side it was tapped on: rightwards along
 * the bar enters from the right, leftwards from the left.
 *
 * The outgoing page is unmounted in the same commit that mounts the new one, so
 * there is never a frame holding both — this animates the arrival only.
 *
 * The first landing has no previous tab and so does not animate, which also
 * keeps the server markup and the first client render identical.
 */
export function PageSlide({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const direction = useRef<"forward" | "back" | null>(null);

  if (previous.current !== pathname) {
    direction.current =
      indexOf(pathname) >= indexOf(previous.current) ? "forward" : "back";
    previous.current = pathname;
  }

  return (
    <div
      // Remounting is what replays the keyframes. A transition would have no
      // starting state to move from, because the node is new every time.
      key={pathname}
      className={direction.current ? "page-slide" : undefined}
      data-direction={direction.current ?? undefined}
    >
      {children}
    </div>
  );
}
