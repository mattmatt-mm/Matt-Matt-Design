import { CalendarBlank } from "@phosphor-icons/react/dist/ssr/CalendarBlank";
import { MapPin } from "@phosphor-icons/react/dist/ssr/MapPin";
import Image from "next/image";
import Link from "next/link";
import type { Comment } from "@/lib/content";
import { profilePath } from "@/lib/site";

const names = new Intl.ListFormat("en", { type: "conjunction" });

export function HomeOverview({ comments }: { comments: Comment[] }) {
  const [kenny, niket, edmond] = ["kenny", "niket", "edmond"].map(
    (slug) => comments.find((comment) => comment.slug === slug),
  );
  const featured = [kenny, niket, edmond].filter((comment) => comment !== undefined);
  const avatars = [edmond, kenny, niket].filter((comment) => comment !== undefined);
  const otherCount = comments.length - featured.length;
  const authors = featured.map((comment) => comment.name);
  if (otherCount > 0) {
    authors.push(`${otherCount} ${otherCount === 1 ? "other" : "others"}`);
  }

  return (
    <section className="home-overview" aria-label="Portfolio overview">
      <div className="home-overview-meta">
        <span>
          <MapPin size={16} aria-hidden="true" />
          Hong Kong &amp; Amsterdam
        </span>
        <span>
          <CalendarBlank size={16} aria-hidden="true" />
          Since 2019
        </span>
      </div>
      <div className="home-overview-stats">
        <span><strong>10</strong> projects</span>
        <span><strong>8</strong> clients</span>
      </div>
      {comments.length > 0 ? (
        <Link href={`${profilePath}#comments`} className="home-overview-comments press-shrink">
          {avatars.length > 0 ? (
            <span className="home-overview-avatars" aria-hidden="true">
              {avatars.map((comment) => (
                <span className="home-overview-avatar" key={comment.slug}>
                  {comment.logo ? (
                    <Image
                      src={comment.logo}
                      width={28}
                      height={28}
                      alt=""
                      unoptimized={comment.logo.endsWith(".svg")}
                    />
                  ) : (
                    comment.initials
                  )}
                </span>
              ))}
            </span>
          ) : null}
          <span>
            {featured.length > 0 ? `Words from ${names.format(authors)}` : "Read comments"}
          </span>
        </Link>
      ) : null}
    </section>
  );
}
