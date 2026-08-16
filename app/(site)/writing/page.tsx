import type { Metadata } from "next";
import { RowList } from "@/components/RowList";
import { getWriting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  alternates: { canonical: "/writing" },
};

export default async function WritingPage() {
  const rows = await getWriting();
  return <RowList rows={rows} />;
}
