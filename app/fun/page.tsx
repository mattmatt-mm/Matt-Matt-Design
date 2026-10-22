import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { FunWall } from "@/components/fun/FunWall";
import { Header } from "@/components/Header";
import { getFun, getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Fun",
  description:
    "Side projects, posters and experiments by Matt Tam of Matt Matt Design, a Hong Kong–based design engineer.",
  alternates: { canonical: "/fun" },
};

/**
 * /fun — side work as a masonry wall. Outside the (site) layout because Matt
 * wanted the wall without the intro (2026-10-23): the name and role stay
 * exactly where every other tab has them, and the wall follows 60px below.
 * See doc/fun-tab-plan.md.
 */
export default async function FunPage() {
  const [pieces, settings] = await Promise.all([getFun(), getSettings()]);
  return (
    <Column>
      <Header name={settings.name} role={settings.role} />
      <div className="mt-15 pt-3">
        <FunWall pieces={pieces} />
      </div>
    </Column>
  );
}
