import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { HomeFeed } from "@/components/HomeFeed";
import { HomeOverview } from "@/components/HomeOverview";
import { Intro } from "@/components/Intro";
import { JsonLd } from "@/components/JsonLd";
import { PortfolioLaunch } from "@/components/PortfolioLaunch";
import { RowList } from "@/components/RowList";
import { getComments, getExperience, getGallery, getSettings } from "@/lib/content";
import { person, siteDescription } from "@/lib/site";
import { homeSchema } from "@/lib/structured-data";

export const metadata: Metadata = {
  description: siteDescription,
  alternates: { canonical: "/" },
};

/** / — home is the Gallery, the left-most tab. */
export default async function HomePage() {
  const [entries, settings, comments, experience] = await Promise.all([
    getGallery(),
    getSettings(),
    getComments(),
    getExperience(),
  ]);
  return (
    <>
      <JsonLd data={homeSchema(settings)} />
      <PortfolioLaunch name={person.name} role={settings.role || person.jobTitle}>
        <RowList rows={experience} />
      </PortfolioLaunch>
      <Header name={settings.name} role={settings.role} />
      <div className="mt-15">
        <Intro
          paragraphs={settings.intro}
          socials={settings.socials}
          email={settings.email}
        />
      </div>
      <main id="portfolio-home" tabIndex={-1} className="mt-6 outline-none">
        <HomeOverview comments={comments} />
        <HomeFeed entries={entries} email={settings.email} />
      </main>
    </>
  );
}
