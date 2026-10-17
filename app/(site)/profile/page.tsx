import type { Metadata } from "next";
import { RowList } from "@/components/RowList";
import { getExperience, getSettings } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Profile",
    description: settings.intro[0] || undefined,
    alternates: { canonical: "/profile" },
  };
}

/** /profile — the Experience list, the right-most tab. */
export default async function ProfilePage() {
  const rows = await getExperience();
  return <RowList rows={rows} cursor="View project" />;
}
