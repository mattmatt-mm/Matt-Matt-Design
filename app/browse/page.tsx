import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { PortfolioBrowse } from "@/components/PortfolioBrowse";
import { getPortfolioSearchEntries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Browse",
  description: "Find case studies, writing, and experiments from Matt Matt Design.",
  alternates: { canonical: "/browse" },
};

export default async function BrowsePage() {
  const entries = await getPortfolioSearchEntries();

  return (
    <Column>
      <main className="browse-page">
        <h1 className="text-title">Browse</h1>
        <PortfolioBrowse entries={entries} />
      </main>
    </Column>
  );
}
