import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Column } from "@/components/Column";
import { Header } from "@/components/Header";
import { Prose } from "@/components/Prose";
import { getSettings, getWritingEntry, listWritingSlugs } from "@/lib/content";

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
    openGraph: { title: entry.title, type: "article" },
  };
}

export default async function WritingPost({ params }: Props) {
  const { slug } = await params;
  const [entry, settings] = await Promise.all([
    getWritingEntry(slug),
    getSettings(),
  ]);

  if (!entry) notFound();

  return (
    <Column>
      <Header name={settings.name} role={settings.role} href="/" />

      <article className="mt-15">
        <h1
          className="text-title"
          lang={entry.lang === "zh" ? "zh-Hant" : undefined}
        >
          {entry.title}
        </h1>
        {entry.label ? (
          <p className="text-muted mt-3 whitespace-pre-line">{entry.label}</p>
        ) : null}

        <div className="mt-6">
          <Prose node={entry.body} lang={entry.lang} />
        </div>
      </article>

      <p className="mt-15">
        <Link href="/writing" className="text-muted hover:text-fg no-underline">
          Back to Writing
        </Link>
      </p>
    </Column>
  );
}
