import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HomeFeed } from "@/components/HomeFeed";
import { HomeOverview } from "@/components/HomeOverview";
import { Intro } from "@/components/Intro";
import { JsonLd } from "@/components/JsonLd";
import { getComments, getGallery, getSettings } from "@/lib/content";
import { siteDescription } from "@/lib/site";
import { homeSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  description: siteDescription,
  alternates: { canonical: "/" },
};

/** / — home is the Gallery, the left-most tab. */
export default async function HomePage() {
  const [entries, settings, comments] = await Promise.all([
    getGallery(),
    getSettings(),
    getComments(),
  ]);
  return (
    <>
      <JsonLd data={homeSchema(settings)} />
      <Header name={settings.name} role={settings.role} />
      <div className="mt-15">
        <Intro
          paragraphs={settings.intro}
          socials={settings.socials}
          email={settings.email}
        />
      </div>
      <main className="mt-6">
        <HomeOverview comments={comments} />
        <HomeFeed entries={entries} email={settings.email} />
      </main>
    </>
  );
}
