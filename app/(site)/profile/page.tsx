import type { Metadata } from "next";
import { Comments } from "@/components/Comments";
import { RowList } from "@/components/RowList";
import { getComments, getExperience } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const titles = (await getExperience())
    .map((row) => row.title)
    .join(", ");
  return {
    title: "Profile",
    description: `Work by Matt, a Hong Kong–based design engineer for UI/UX, brand design and AI transformation: ${titles}.`,
    alternates: { canonical: "/profile" },
  };
}

/** /profile — the Experience list, the right-most tab, with the floating
 * comments beneath it. */
export default async function ProfilePage() {
  const [rows, comments] = await Promise.all([getExperience(), getComments()]);
  return (
    <>
      <RowList rows={rows} cursor="View project" />
      <Comments comments={comments} />
    </>
  );
}
