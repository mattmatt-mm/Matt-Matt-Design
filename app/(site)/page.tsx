import type { Metadata } from "next";
import { GalleryList } from "@/components/GalleryList";
import { JsonLd } from "@/components/JsonLd";
import { getGallery, getSettings } from "@/lib/content";
import { siteDescription } from "@/lib/site";
import { homeSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  description: siteDescription,
  alternates: { canonical: "/" },
};

/** / — home is the Gallery, the left-most tab. */
export default async function HomePage() {
  const [entries, settings] = await Promise.all([getGallery(), getSettings()]);
  return (
    <div className="pt-3">
      <JsonLd data={homeSchema(settings)} />
      <GalleryList entries={entries} />
    </div>
  );
}
