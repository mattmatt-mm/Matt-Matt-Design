import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChainGate } from "@/components/ChainGate";
import { Column } from "@/components/Column";
import { DetailChain } from "@/components/DetailChain";
import { Header } from "@/components/Header";
import { Prose } from "@/components/Prose";
import { SectionRail } from "@/components/SectionRail";
import { Stat, Stats } from "@/components/Stats";
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
      <DetailChain basePath="/work">
        {tour.map((study, i) => (
          <article
            key={study.slug}
            data-chain-entry={study.slug}
            data-title={`${study.title} — ${siteName}`}
            className={i === 0 ? "mt-15" : "mt-32"}
          >
            {i === 0 ? (
              <h1 className="text-title">{study.title}</h1>
            ) : (
              <ChainGate title={study.title} />
            )}

            {/* `label` groups rows in the list only — it is not shown here.
                `cover` is the social-preview image; the body already opens
                with it, so rendering it again would duplicate the lead. */}
            <div className={i === 0 ? "mt-6" : "chain-gate-body mt-6"}>
              {/* When the project ran and who did what, as figures under
                  its name. */}
              {study.start || study.end || study.role || study.team ? (
                <div className="mb-12">
                  <Stats>
                    {study.start ? <Stat value={study.start} label="Start" /> : null}
                    {study.end ? <Stat value={study.end} label="End" /> : null}
                    {study.role ? <Stat value={study.role} label="Role" /> : null}
                    {study.team ? <Stat value={study.team} label="Team" /> : null}
                  </Stats>
                </div>
              ) : null}
              <Prose node={study.body} idPrefix={study.slug} />
            </div>
          </article>
        ))}
      </DetailChain>

      <p className="mt-15">
        <Link href="/" className="text-muted hover:text-fg no-underline">
          Back to Experience
        </Link>
      </p>
    </Column>
  );
}
