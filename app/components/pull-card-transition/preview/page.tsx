import type { Metadata } from "next";
import { PortfolioLaunch } from "@/components/PortfolioLaunch";
import { RowList } from "@/components/RowList";
import { getBadgeStickers, getExperience, getSettings } from "@/lib/content";
import { person } from "@/lib/site";
import styles from "@/components/library/Library.module.css";

export const metadata: Metadata = {
  title: "Pull card preview",
  robots: { index: false, follow: false },
};

export default async function PullCardPreviewPage() {
  const [settings, experience] = await Promise.all([getSettings(), getExperience()]);
  const role = settings.role || person.jobTitle;

  return (
    <div className={styles.pullPreview}>
      <PortfolioLaunch name={person.name} role={role} stickers={getBadgeStickers(settings.recognitions)} embedded>
        <RowList rows={experience.map(({ title, group }) => ({ title, group }))} />
      </PortfolioLaunch>
      <main id="portfolio-home" tabIndex={-1} className="grid min-h-svh content-center justify-center gap-2 px-6 text-center outline-none">
        <p className="text-muted-readable">{role}</p>
        <h1 className="text-title">{person.name}</h1>
        <p>You’re in.</p>
      </main>
    </div>
  );
}
