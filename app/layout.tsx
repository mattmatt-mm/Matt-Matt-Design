import type { Metadata } from "next";
import { geistPixel } from "./fonts";
import { siteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Matt — Design Engineer",
    template: "%s — Matt",
  },
  description:
    "Matt is a design engineer leading brand design at HKUST AIS and co-founder of Incipe Academy.",
  openGraph: {
    type: "website",
    siteName: "Matt",
    locale: "en",
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={geistPixel.variable}>
      <body>{children}</body>
    </html>
  );
}
