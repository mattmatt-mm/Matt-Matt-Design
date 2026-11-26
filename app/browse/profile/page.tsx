import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { Comments } from "@/components/Comments";
import { ExperienceBadge } from "@/components/ExperienceBadge";
import { JsonLd } from "@/components/JsonLd";
import { RowList } from "@/components/RowList";
import { getBadgeStickers, getComments, getExperience, getSettings, recognitionLabel, type Recognition } from "@/lib/content";
import { person, profilePath, siteName, siteSocialImage } from "@/lib/site";
import { profileSchema } from "@/lib/structured-data";

function profileDescription(recognitions: Recognition[]) {
  const identity = `${person.name} is the Hong Kong–based design engineer behind ${siteName}.`;
  const highlights = recognitions.slice(0, 2).map(recognitionLabel);
  return [identity, ...highlights.map((entry) => `${entry}.`)].join(" ");
}

export async function generateMetadata(): Promise<Metadata> {
  const { recognitions } = await getSettings();
  const description = profileDescription(recognitions);
  return {
    title: person.name,
    description,
    alternates: { canonical: profilePath },
    openGraph: {
      title: `${person.name} — ${siteName}`,
      description,
      type: "profile",
      url: profilePath,
      siteName,
      images: [siteSocialImage],
    },
  };
}

export default async function ProfilePage() {
  const [rows, comments, settings] = await Promise.all([
    getExperience(),
    getComments(),
    getSettings(),
  ]);
  return (
    <main className="[container-type:inline-size]">
      <JsonLd data={profileSchema(settings, profileDescription(settings.recognitions))} />
      <Column>
        <ExperienceBadge
          name={person.name}
          role={settings.role || person.jobTitle}
          stickers={getBadgeStickers(settings.recognitions)}
          commentsHref={comments.length ? "#comments" : undefined}
        >
          <RowList rows={rows} cursor="View project" />
        </ExperienceBadge>
        <Comments comments={comments} />
      </Column>
    </main>
  );
}
