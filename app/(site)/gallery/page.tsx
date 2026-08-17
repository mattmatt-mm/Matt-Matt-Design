import type { Metadata } from "next";
import { GalleryList } from "@/components/GalleryList";
import { getGallery } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gallery",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const entries = await getGallery();
  return (
    <div className="pt-3">
      <GalleryList entries={entries} />
    </div>
  );
}
