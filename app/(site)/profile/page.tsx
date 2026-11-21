import type { Metadata } from "next";
import { Comments } from "@/components/Comments";
import { RowList } from "@/components/RowList";
import { getComments, getExperience } from "@/lib/content";
import { profileTitle } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const titles = (await getExperience())
    .map((row) => row.title)
    .join(", ");
  return {
    title: profileTitle,
    description: `Work by Matt Tam of Matt Matt Design, a Hong Kong–based design engineer for UI/UX, brand design and AI transformation: ${titles}.`,
    alternates: { canonical: "/profile" },
  };
}

/** The Experience list and floating comments, accessible from Browse. */
export default async function ProfilePage() {
  const [rows, comments] = await Promise.all([getExperience(), getComments()]);
  return (
    <main>
      <h1 className="mb-6 text-title">{profileTitle}</h1>
      <RowList rows={rows} cursor="View project" />
      <Comments comments={comments} />
    </main>
  );
}
