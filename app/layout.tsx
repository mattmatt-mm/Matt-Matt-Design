import type { Metadata, Viewport } from "next";
import { SquircleNoScript } from "@squircle-js/react";
import {
  siteDescription,
  siteName,
  siteSocialImage,
  siteTitle,
  siteUrl,
} from "@/lib/site";
import { AIExperience } from "@/components/ai/AIExperience";
import { SmoothScrollLens } from "@/components/effects/SmoothScrollLens";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s — Matt",
  },
  description: siteDescription,
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "/",
    type: "website",
    siteName,
    locale: "en_US",
    images: [siteSocialImage],
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFDFC" },
    { media: "(prefers-color-scheme: dark)", color: "#12110F" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* Browser extensions (Grammarly, password managers) add attributes to
          <body> before React hydrates, which otherwise reports a mismatch that
          has nothing to do with this code. This suppresses the warning for
          <body>'s own attributes only — one level deep — so genuine hydration
          bugs anywhere inside the app are still reported. */}
      <body suppressHydrationWarning>
        <SquircleNoScript />
        <AIExperience>
          <div data-lens-content>{children}</div>
        </AIExperience>
        <SmoothScrollLens />
      </body>
    </html>
  );
}
