import type { MetadataRoute } from "next";
import { siteDescription, siteName, siteTitle } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: siteTitle,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FDFDFC",
    theme_color: "#FDFDFC",
    icons: [
      {
        src: "/icons/chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/pwa-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
