import { ChainGate } from "@/components/ChainGate";
import { DetailChain } from "@/components/DetailChain";
import { Prose } from "@/components/Prose";
import { Stat, Stats } from "@/components/Stats";
import type { CaseStudy } from "@/lib/content";
import { siteName } from "@/lib/site";

/**
 * Case studies read one into the next, as on `/work/*`. A guided walkthrough
 * (`/tour/*`) runs the same chain over its own selection, but keeps its URL —
 * the entries it holds still live under `/work`. See
 * doc/case-study-continuous-scroll-plan.md and doc/hr-mode-plan.md.
 */
export function CaseStudyChain({
  studies,
  eyebrow,
  source = "site",
}: {
  studies: CaseStudy[];
  /** A muted line over the first title. */
  eyebrow?: string;
  source?: "site" | "tour";
}) {
  return (
    <DetailChain basePath="/work" followUrl={source === "site"} source={source}>
      {studies.map((study, i) => (
        <article
          key={study.slug}
          data-chain-entry={study.slug}
          data-title={`${study.title} — ${siteName}`}
          className={i === 0 ? "mt-15" : "mt-32"}
        >
          {i === 0 ? (
            <>
              {/* The walkthrough splash (components/ai/WalkthroughSplash)
                  glides its own copies onto these two. */}
              {eyebrow ? (
                <p className="text-muted" data-splash-target="eyebrow">
                  {eyebrow}
                </p>
              ) : null}
              <h1
                className="text-title"
                data-splash-target={eyebrow ? "title" : undefined}
              >
                {study.title}
              </h1>
            </>
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
                  {study.start || study.end ? (
                    <Stat
                      value={[study.start, study.end].filter(Boolean).join(" – ")}
                      label="Timeline"
                    />
                  ) : null}
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
  );
}
