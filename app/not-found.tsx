import type { Metadata } from "next";
import Link from "next/link";
import { Column } from "@/components/Column";
import { Header } from "@/components/Header";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false },
};

/**
 * A little oak grows and drops a leaf beside the missing-page message.
 * Reduced motion uses the final still frame instead of the animated asset.
 */
export default async function NotFound() {
  const settings = await getSettings();

  return (
    <Column>
      <Header name={settings.name} role={settings.role} href="/" />

      <div className="not-found-ground mt-15">
        <p className="pb-3">
          Nothing here. Yet.
          <br />
          <span className="text-muted">It may have moved, or never existed.</span>
        </p>
        <svg
          className="not-found-tree"
          viewBox="0 0 320 320"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter id="not-found-tree-ink" colorInterpolationFilters="sRGB">
              {/* Extract dark ink; transparent pixels and pale fills disappear. */}
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.2126 -0.7152 -0.0722 1 0"
              />
              <feComponentTransfer result="ink">
                <feFuncA type="linear" slope="1.25" intercept="-0.2" />
              </feComponentTransfer>
              <feFlood floodColor="currentColor" />
              <feComposite in2="ink" operator="in" />
            </filter>
          </defs>
          <g filter="url(#not-found-tree-ink)">
            <image
              className="not-found-tree-motion"
              href="/figures/404-tree-growth.gif"
              width="320"
              height="320"
            />
            <image
              className="not-found-tree-still"
              href="/figures/404-tree-still.png"
              width="320"
              height="320"
            />
          </g>
        </svg>
      </div>

      <p className="mt-6">
        <Link href="/">Back to Home</Link>
      </p>
    </Column>
  );
}
