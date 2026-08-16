import type { Metadata } from "next";
import { RowList } from "@/components/RowList";
import { getExperience, getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    description: settings.intro[0] || undefined,
    alternates: { canonical: "/" },
  };
}

export default async function ExperiencePage() {
  const rows = await getExperience();
  return <RowList rows={rows} />;
}
