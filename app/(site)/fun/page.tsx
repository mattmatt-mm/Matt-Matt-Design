import type { Metadata } from "next";
import { FunWall } from "@/components/fun/FunWall";
import { getFun } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fun",
  description:
    "Side projects, posters and experiments by Matt Tam of Matt Matt Design, a Hong Kong–based design engineer.",
  alternates: { canonical: "/fun" },
};

/** Side work as a masonry wall. See doc/fun-tab-plan.md. */
export default async function FunPage() {
  const pieces = await getFun();
  return (
    <main>
      <h1 className="mb-6 text-title">Fun</h1>
      <FunWall pieces={pieces} />
    </main>
  );
}
