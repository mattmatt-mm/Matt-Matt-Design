import type { Metadata } from "next";
import { RowList } from "@/components/RowList";
import { getWriting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Writing by Matt Tam of Matt Matt Design, a Hong Kong–based design engineer, on interface design, motion and taste. In English and Chinese.",
  alternates: { canonical: "/writing" },
};

export default async function WritingPage() {
  const rows = await getWriting();
  return (
    <main>
      <h1 className="mb-6 text-title">Writing</h1>
      <RowList rows={rows} />
    </main>
  );
}
