import Image from "next/image";
import { Star } from "@phosphor-icons/react/dist/ssr/Star";
import { StarHalf } from "@phosphor-icons/react/dist/ssr/StarHalf";
import { CommentsFloat } from "@/components/effects/CommentsFloat";
import { SiteSquircle } from "@/components/SiteSquircle";
import type { Comment } from "@/lib/content";

function Stars({ rating }: { rating: number }) {
  const whole = Math.floor(rating);
  const half = rating - whole >= 0.5;
  return (
    <div className="comment-stars">
      <span className="sr-only">Rated {rating} out of 5</span>
      {Array.from({ length: whole }, (_, i) => (
        <Star key={i} size={16} weight="fill" aria-hidden />
      ))}
      {half ? <StarHalf size={16} weight="fill" aria-hidden /> : null}
    </div>
  );
}

function Avatar({ logo, initials }: Pick<Comment, "logo" | "initials">) {
  return (
    <SiteSquircle cornerRadius={8} className="comment-avatar" aria-hidden>
      {logo ? (
        // an SVG logo is already sharp at any size, and the optimiser refuses SVG
        <Image
          src={logo}
          alt=""
          width={40}
          height={40}
          unoptimized={logo.endsWith(".svg")}
        />
      ) : (
        <span>{initials}</span>
      )}
    </SiteSquircle>
  );
}

/**
 * Comments from clients and users, floating below the Experience list on
 * /profile. They travel in a straight line, bottom left to top right, as the
 * page scrolls (`CommentsFloat`); see doc/profile-comments-plan.md.
 */
export function Comments({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null;

  return (
    <section aria-label="Comments" className="mt-24">
      <CommentsFloat>
        {comments.map((c) => (
          <li key={c.name} className="comment-slot" data-float>
            <div className="comment-float">
              <div className="comment-lift">
                <SiteSquircle className="comment-card">
                  <figure>
                    {c.rating ? <Stars rating={c.rating} /> : null}
                    <blockquote className="comment-quote">{c.comment}</blockquote>
                    <figcaption className="comment-by">
                      <Avatar logo={c.logo} initials={c.initials} />
                      <span>
                        <span className="block">{c.name}</span>
                        <span className="block text-muted">{c.role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </SiteSquircle>
              </div>
            </div>
          </li>
        ))}
      </CommentsFloat>
    </section>
  );
}
