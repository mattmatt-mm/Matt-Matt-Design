import type { Metadata } from "next";
import { Column } from "@/components/Column";
import { IsdReview } from "@/components/isd/IsdReview";

// A review page for the ISD dot hero while it is being tuned
// (doc/isd-dot-hero-plan.md). Not linked from the site and not indexed.
export const metadata: Metadata = {
  title: "ISD dot hero — review",
  robots: { index: false, follow: false },
};

export default function IsdHeroReviewPage() {
  return (
    <Column>
      <h1 className="text-title">ISD dot hero</h1>
      <p className="text-muted mt-3">Review build. Scrub, pause and step through each beat.</p>
      <div className="mt-12">
        <IsdReview />
      </div>
    </Column>
  );
}
