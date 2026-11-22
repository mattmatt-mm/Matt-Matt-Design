import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { Comments } from "@/components/Comments";
import { ExperienceBadge } from "@/components/ExperienceBadge";
import { RowList } from "@/components/RowList";
import { getComments, getExperience, getSettings } from "@/lib/content";
import { person, profilePath, profileTitle } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const titles = (await getExperience())
    .map((row) => row.title)
    .join(", ");
  return {
    title: profileTitle,
    description: `Work by Matt Tam of Matt Matt Design, a Hong Kong–based design engineer for UI/UX, brand design and AI transformation: ${titles}.`,
    alternates: { canonical: profilePath },
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
      <Column>
        <ExperienceBadge
          name={person.name}
          role={settings.role || person.jobTitle}
          commentsHref={comments.length ? "#comments" : undefined}
        >
          <RowList rows={rows} cursor="View project" />
        </ExperienceBadge>
        <Comments comments={comments} />
      </Column>
    </main>
  );
}
