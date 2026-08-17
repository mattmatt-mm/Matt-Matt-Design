import { Column } from "@/components/Column";
import { GalleryList } from "@/components/GalleryList";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { TabBar } from "@/components/TabBar";
import { getGallery, getSettings } from "@/lib/content";

/**
 * The masthead is a layout segment, not part of any page, so switching tabs
 * never remounts or reflows it. The gallery sits below the tabbed list as its
 * own section, independent of which tab is open.
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, gallery] = await Promise.all([getSettings(), getGallery()]);

  return (
    <Column>
      <Header name={settings.name} role={settings.role} />

      <div className="mt-15">
        <Intro
          paragraphs={settings.intro}
          socials={settings.socials}
          email={settings.email}
        />
      </div>

      <div className="mt-15">
        <TabBar />
      </div>

      {children}

      {gallery.length > 0 ? (
        <section className="mt-15" aria-labelledby="gallery-heading">
          {/* 16px like everything else — the section reads as a section
              through colour and position, not a bigger typeface. */}
          <h2 id="gallery-heading" className="text-muted">
            Gallery
          </h2>
          <div className="mt-3">
            <GalleryList entries={gallery} />
          </div>
        </section>
      ) : null}
    </Column>
  );
}
