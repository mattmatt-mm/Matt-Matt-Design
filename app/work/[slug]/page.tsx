import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyChain } from "@/components/CaseStudyChain";
import { Column } from "@/components/Column";
import { Header } from "@/components/Header";
import { SectionRail } from "@/components/SectionRail";
import {
  getCaseStudyTour,
  getExperienceEntry,
  getSettings,
  listExperienceSlugs,
} from "@/lib/content";
import { siteName, siteSocialImage } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const entries = await listExperienceSlugs();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getExperienceEntry(slug);
  if (!entry) return {};

  return {
    title: entry.title,
    description: entry.summary || undefined,
    alternates: { canonical: `/work/${slug}` },
    openGraph: {
      title: entry.title,
      description: entry.summary || undefined,
      siteName,
      images: entry.cover ? [entry.cover] : [siteSocialImage],
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const [entry, tour, settings] = await Promise.all([
    getExperienceEntry(slug),
    getCaseStudyTour(slug),
    getSettings(),
  ]);

  if (!entry || !entry.hasPage || entry.externalUrl) notFound();

  return (
    <Column>
      <Header name={settings.name} role={settings.role} href="/" />
      <SectionRail />

      {/* The rest of the case studies follow in list order, so reaching the
          end keeps scrolling into the next one while the URL follows along.
          See doc/case-study-continuous-scroll-plan.md. */}
      <CaseStudyChain studies={tour} />

      <p className="mt-15">
        <Link href="/profile" className="text-muted hover:text-fg no-underline">
          Back to Profile
        </Link>
      </p>
    </Column>
  );
}
