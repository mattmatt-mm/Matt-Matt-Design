import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChainGate } from "@/components/ChainGate";
import { Column } from "@/components/Column";
import { DetailChain } from "@/components/DetailChain";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { SectionRail } from "@/components/SectionRail";
import { ThumbnailSquircle } from "@/components/SiteSquircle";
import {
  getWritingEntry,
  getWritingTour,
  listWritingSlugs,
} from "@/lib/content";
import { siteName, siteSocialImage } from "@/lib/site";
import { postSchema } from "@/lib/structured-data";

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
    description: entry.description || undefined,
    alternates: { canonical: `/writing/${slug}` },
    openGraph: {
      title: entry.title,
      description: entry.description || undefined,
      siteName,
      type: "article",
      publishedTime: entry.publishedAt ?? undefined,
      locale: entry.lang === "zh" ? "zh_HK" : "en_US",
      images: entry.cover ? [entry.cover] : [siteSocialImage],
    },
  };
}

export default async function WritingPost({ params }: Props) {
  const { slug } = await params;
  const [entry, tour] = await Promise.all([
    getWritingEntry(slug),
    getWritingTour(slug),
  ]);

  if (!entry) notFound();

  return (
    <Column>
      <JsonLd
        data={postSchema({
          slug,
          title: entry.title,
          description: entry.description,
          publishedAt: entry.publishedAt,
          lang: entry.lang,
          cover: entry.cover,
        })}
      />
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
              className={i > 0 ? "mt-32" : undefined}
            >
              {i === 0 ? (
                <h1 className="text-title" lang={lang}>
                  {post.title}
                </h1>
              ) : (
                <ChainGate title={post.title} lang={lang} />
              )}

              <div className={i === 0 ? "mt-6" : "chain-gate-body mt-6"}>
                {post.coverImage && (
                  <ThumbnailSquircle>
                    <Image
                      {...post.coverImage}
                      alt=""
                      sizes="(min-width: 688px) 640px, calc(100vw - 48px)"
                      priority={i === 0}
                      className="mb-6 block h-auto w-full cursor-zoom-in focus-visible:-outline-offset-4"
                      data-zoom=""
                      data-cursor="Zoom"
                      role="button"
                      tabIndex={0}
                      aria-label={`Zoom cover image for ${post.title}`}
                    />
                  </ThumbnailSquircle>
                )}
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
