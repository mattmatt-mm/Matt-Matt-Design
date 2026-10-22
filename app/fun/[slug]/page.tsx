import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FunPiece } from "@/components/fun/FunPiece";
import { getFun } from "@/lib/content";
import { siteName, siteSocialImage } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams() {
  const pieces = await getFun();
  return pieces.map((p) => ({ slug: p.slug }));
}

async function pieceFor(slug: string) {
  return (await getFun()).find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const piece = await pieceFor((await params).slug);
  if (!piece) return {};
  return {
    title: piece.title,
    description: piece.subtitle || undefined,
    alternates: { canonical: `/fun/${piece.slug}` },
    openGraph: {
      title: piece.title,
      description: piece.subtitle || undefined,
      siteName,
      images: piece.image ? [piece.image.src] : [siteSocialImage],
    },
  };
}

/**
 * /fun/<slug> — one piece, a detail page like a case study: the dock
 * contracts to the back arrow, which returns to the wall.
 */
export default async function FunPiecePage({ params }: Props) {
  const piece = await pieceFor((await params).slug);
  if (!piece) notFound();
  return <FunPiece piece={piece} />;
}
