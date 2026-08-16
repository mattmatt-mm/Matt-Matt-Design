import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Column } from "@/components/Column";
import { Header } from "@/components/Header";
import { Prose } from "@/components/Prose";
import {
  getExperienceEntry,
  getSettings,
  listExperienceSlugs,
} from "@/lib/content";

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
      images: entry.cover ? [entry.cover] : undefined,
    },
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const [entry, settings] = await Promise.all([
    getExperienceEntry(slug),
    getSettings(),
  ]);

  if (!entry || !entry.hasPage || entry.externalUrl) notFound();

  return (
    <Column>
      <Header name={settings.name} role={settings.role} href="/" />

      <article className="mt-15">
        <h1 className="text-title">{entry.title}</h1>

        {/* `label` groups rows in the list only — it is not shown here.
            `cover` is the social-preview image; the body already opens with it,
            so rendering it again here would just duplicate the lead image. */}
        <div className="mt-6">
          <Prose node={entry.body} />
        </div>
      </article>

      <p className="mt-15">
        <Link href="/" className="text-muted hover:text-fg no-underline">
          Back to Experience
        </Link>
      </p>
    </Column>
  );
}
