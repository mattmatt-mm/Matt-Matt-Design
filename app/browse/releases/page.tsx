import type { Metadata } from "next";
import Link from "next/link";
import { Column } from "@/components/Column";
import { ReleasePreviews } from "@/components/releases/ReleasePreviews";
import { releases, releaseVersion } from "@/lib/releases";
import { releasesPath } from "@/lib/site";

const description = "Site updates from Matt Matt Design, with release notes and links to try the latest features.";

export const metadata: Metadata = {
  title: "Releases",
  description,
  alternates: { canonical: releasesPath },
};

export const dynamic = "force-static";

const releaseDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });

export default function ReleasesPage() {
  return (
    <Column>
      <main>
        <h1 className="text-title">Releases</h1>
        <p className="mt-2 text-muted-readable">A history of updates to Matt Matt Design.</p>
        <ol aria-label="Release history" className="mt-8 divide-y divide-line">
          {releases.map((release, index) => {
            const version = releaseVersion(release.patch);
            return (
              <li key={version} className="py-6 first:pt-0">
                <article id={version} aria-labelledby={`${version}-heading`} className="scroll-mt-6">
                  {index === 0 && <p className="mb-2 text-muted-readable">Latest release</p>}
                  <h2 id={`${version}-heading`} className="text-section font-bold">{version}</h2>
                  <time dateTime={release.date} className="mt-1 block text-muted-readable">
                    {releaseDate.format(new Date(`${release.date}T00:00:00Z`))}
                  </time>
                  <h3 className="mt-4 text-section font-bold">{release.title}</h3>
                  <p className="mt-1">{release.summary}</p>
                  {release.previews && <ReleasePreviews previews={release.previews} />}
                  {release.changes && (
                    <ul className="mt-4 list-disc space-y-2 ps-6">
                      {release.changes.map((change, changeIndex) => (
                        <li key={changeIndex}>
                          {change.map((part) => typeof part === "string" ? part : (
                            <Link key={part.href} href={part.href}>{part.label}</Link>
                          ))}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
      </main>
    </Column>
  );
}
