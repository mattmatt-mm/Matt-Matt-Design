import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

/**
 * The admin UI ships its own typography and chrome, so it opts out of the
 * site's pixel font and paper background.
 */
export default function KeystaticLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="keystatic-root">{children}</div>;
}
