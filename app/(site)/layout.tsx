import { Column } from "@/components/Column";
import { Header } from "@/components/Header";
import { Intro } from "@/components/Intro";
import { TabBar } from "@/components/TabBar";
import { getSettings } from "@/lib/content";

/**
 * The masthead is a layout segment, not part of any page, so switching tabs
 * never remounts or reflows it.
 */
export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

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
    </Column>
  );
}
