import type { Metadata } from "next";
import { GalleryList } from "@/components/GalleryList";
import { getGallery, getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    description: settings.intro[0] || undefined,
    alternates: { canonical: "/" },
  };
}

/** / — home is the Gallery, the left-most tab. */
export default async function HomePage() {
  const entries = await getGallery();
  return (
    <div className="pt-3">
      <GalleryList entries={entries} />
    </div>
  );
}
