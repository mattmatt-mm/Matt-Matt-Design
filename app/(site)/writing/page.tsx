import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ThumbnailSquircle } from "@/components/SiteSquircle";
import { getWriting } from "@/lib/content";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Writing by Matt Tam of Matt Matt Design, a Hong Kong–based design engineer, on interface design, motion and taste. In English and Chinese.",
  alternates: { canonical: "/writing" },
};

const publishDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default async function WritingPage() {
  const posts = await getWriting();
  return (
    <main>
      <h1 className="mb-2 text-title">Writing</h1>
      <ul>
        {posts.map((post) => {
          const titleId = `writing-${post.slug}`;
          const lang = post.lang === "zh" ? "zh-Hant" : undefined;

          return (
            <li key={post.slug} className="border-b border-line">
              <article>
                <Link
                  href={`/writing/${post.slug}`}
                  aria-labelledby={titleId}
                  className="group press-shrink flex flex-col gap-3 py-4 no-underline sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt} className="block text-muted-readable">
                        {publishDate.format(new Date(post.publishedAt))}
                      </time>
                    )}
                    <h2
                      id={titleId}
                      lang={lang}
                      className="truncate text-section font-bold transition-opacity group-hover:opacity-60"
                    >
                      {post.title}
                    </h2>
                    {post.description && (
                      <p lang={lang} className="line-clamp-2 text-muted-readable">
                        {post.description}
                      </p>
                    )}
                  </div>
                  {post.cover && (
                    <ThumbnailSquircle>
                      <Image
                        src={post.cover}
                        alt=""
                        width={1200}
                        height={630}
                        sizes="(min-width: 640px) 192px, calc(100vw - 48px)"
                        className="order-first aspect-[1200/630] h-auto w-full object-cover sm:order-last sm:w-48 sm:shrink-0"
                      />
                    </ThumbnailSquircle>
                  )}
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
