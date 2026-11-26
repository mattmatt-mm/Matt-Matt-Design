import type { Metadata } from "next";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { Column } from "@/components/Column";
import { ThumbnailSquircle } from "@/components/SiteSquircle";
import { getReleases, releaseSource, releaseVersion } from "@/lib/releases";
import { releasesPath } from "@/lib/site";

const description = "Version history for Matt Matt Design, with release notes and links to the changes on GitHub.";

export const metadata: Metadata = {
  title: "Releases",
  description,
  alternates: { canonical: releasesPath },
};

export const dynamic = "force-static";

const releaseDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export default async function ReleasesPage() {
  const { releases, historyUnavailable } = await getReleases();
  const showPreview = !process.env.VERCEL_ENV && releases[0]?.patch === 13;

  return (
    <Column>
      <main>
        <h1 className="text-title">Releases</h1>
        <p className="mt-2 text-muted-readable">A history of updates to Matt Matt Design.</p>
        {showPreview && (
          <section aria-labelledby="release-preview" className="mt-8 border-b border-line pb-6">
            <p className="mb-2 text-muted-readable">Upcoming</p>
            <h2 id="release-preview" className="text-section font-bold">v0.1.14</h2>
            <ul className="mt-3 list-disc space-y-2 ps-6">
              <li>Added the component library with installable Notes, Dynamic Dock, and Flipbook.</li>
              <li>Updated Browse, added Writing cover images, and opened a Releases page.</li>
              <li>Refined the guided walkthrough, sticker returns, and Flipbook spine shadow.</li>
            </ul>
          </section>
        )}
        {historyUnavailable && (
          <p className="mt-8 text-muted-readable">Showing the archived releases while newer build history is unavailable.</p>
        )}
        <ol aria-label="Release history" className="mt-8 divide-y divide-line">
          {releases.map((release, index) => {
            const version = releaseVersion(release.patch);
            const source = release.pullRequest ? `Pull request #${release.pullRequest}` : `Commit ${release.commit.slice(0, 7)}`;
            return (
              <li key={release.commit} className="py-6 first:pt-0">
                <article id={version} aria-labelledby={`${version}-heading`} className="scroll-mt-6">
                  {index === 0 && <p className="mb-2 text-muted-readable">{historyUnavailable ? "Latest archived release" : "Latest release"}</p>}
                  <h2 id={`${version}-heading`} className="text-section font-bold">{version}</h2>
                  <time dateTime={release.date} className="mt-1 block text-muted-readable">
                    {releaseDate.format(new Date(`${release.date}T00:00:00Z`))}
                  </time>
                  <h3 className="mt-4 text-section font-bold">{release.title}</h3>
                  {release.summary && <p className="mt-1">{release.summary}</p>}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <a href={releaseSource(release)}>
                      {source} <ArrowUpRight size={12} weight="bold" className="inline" aria-hidden />
                    </a>
                    {release.branch && (
                      <ThumbnailSquircle>
                        <code className="max-w-full break-all bg-surface-active px-2 py-1 text-muted-readable">{release.branch}</code>
                      </ThumbnailSquircle>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </main>
    </Column>
  );
}
