import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChainGate } from "@/components/ChainGate";
import { Column } from "@/components/Column";
import { DetailChain } from "@/components/DetailChain";
import { Header } from "@/components/Header";
import { Prose } from "@/components/Prose";
import { SectionRail } from "@/components/SectionRail";
import {
  getSettings,
  getWritingEntry,
  getWritingTour,
  listWritingSlugs,
} from "@/lib/content";
import {
  siteDescription,
  siteName,
  siteSocialImage,
} from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const entries = await listWritingSlugs();
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getWritingEntry(slug);
  if (!entry) return {};

  return {
    title: entry.title,
    alternates: { canonical: `/writing/${slug}` },
    openGraph: {
      title: entry.title,
      description: siteDescription,
      siteName,
      type: "article",
      images: [siteSocialImage],
    },
  };
}

export default async function WritingPost({ params }: Props) {
  const { slug } = await params;
  const [entry, tour, settings] = await Promise.all([
    getWritingEntry(slug),
    getWritingTour(slug),
    getSettings(),
  ]);

  if (!entry) notFound();

  return (
    <Column>
      <Header name={settings.name} role={settings.role} href="/" />
      <SectionRail />

      {/* The other posts follow, newest first as on the list, so reaching
          the end keeps scrolling into the next one through its gate while the
          URL follows along. See doc/case-study-continuous-scroll-plan.md. */}
      <DetailChain basePath="/writing">
        {tour.map((post, i) => {
          const lang = post.lang === "zh" ? "zh-Hant" : undefined;
          return (
            <article
              key={post.slug}
              data-chain-entry={post.slug}
              data-title={`${post.title} — ${siteName}`}
              className={i === 0 ? "mt-15" : "mt-32"}
            >
              {i === 0 ? (
                <h1 className="text-title" lang={lang}>
                  {post.title}
                </h1>
              ) : (
                <ChainGate title={post.title} lang={lang} />
              )}

              {/* `label` groups rows in the list only — it is not shown here. */}
              <div className={i === 0 ? "mt-6" : "chain-gate-body mt-6"}>
                <Prose node={post.body} lang={post.lang} idPrefix={post.slug} />
              </div>
            </article>
          );
        })}
      </DetailChain>

      <p className="mt-15">
        <Link href="/writing" className="text-muted hover:text-fg no-underline">
          Back to Writing
        </Link>
      </p>
    </Column>
  );
}
