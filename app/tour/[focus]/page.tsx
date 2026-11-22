import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyChain } from "@/components/CaseStudyChain";
import { Column } from "@/components/Column";
import { SectionRail } from "@/components/SectionRail";
import { getDisciplineTour } from "@/lib/content";
import {
  allFocusSlugs,
  parseFocus,
  walkthroughEyebrow,
} from "@/lib/disciplines";

type Props = { params: Promise<{ focus: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  return allFocusSlugs().map((focus) => ({ focus }));
}

export const metadata: Metadata = {
  title: "Walkthrough",
  // Every entry here already has its canonical page under /work.
  robots: { index: false, follow: true },
};

/**
 * /tour/<focus> — the guided walkthrough the AI hands a recruiter: only the
 * case studies tagged with what they picked. See doc/hr-mode-plan.md.
 */
export default async function TourPage({ params }: Props) {
  const { focus } = await params;
  const picks = parseFocus(focus);
  if (!picks) notFound();

  const studies = await getDisciplineTour(picks);
  if (!studies.length) notFound();

  return (
    <Column>
      <SectionRail />

      <CaseStudyChain
        studies={studies}
        source="tour"
        eyebrow={walkthroughEyebrow(picks)}
      />

      <p className="mt-15">
        <Link href="/" className="text-muted hover:text-fg no-underline">
          See all work
        </Link>
      </p>
    </Column>
  );
}
