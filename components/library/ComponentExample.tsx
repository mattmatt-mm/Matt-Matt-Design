import { Notes } from "@/components/Notes";
import { SitePhotobook } from "@/components/photobook/SitePhotobook";
import type { LibraryModule } from "@/lib/component-library";
import { PULL_CARD_PREVIEW_PATH } from "@/lib/portfolio-launch";
import { DockExample } from "./DockExample";
import styles from "./Library.module.css";

const samplePages = [
  "Front cover of Field notes",
  "The first shape, a blue circle",
  "The second shape, a golden semicircle",
  "The third shape, an orange ellipse",
  "The fourth shape, a green grid",
  "Back cover of Field notes",
].map((alt, index) => ({
  src: `/images/components/flipbook/page-${index + 1}.webp`,
  width: 600,
  height: 848,
  alt,
}));

export function ComponentExample({ component }: { component: LibraryModule }) {
  switch (component.slug) {
    case "notes": {
      const [intro, list] = component.prompt.split("\n\n");
      return <div className={`${styles.notesExample} prose`}>
        <Notes title="Notes recipe">
          <p>{intro}</p>
          <ul>{list.split("\n").map((step) => <li key={step}>{step.slice(2)}</li>)}</ul>
        </Notes>
      </div>;
    }
    case "dynamic-dock":
      return <DockExample />;
    case "flipbook":
      return <div className={styles.bookExample}><SitePhotobook pages={samplePages} label="Field notes flipbook" /></div>;
    case "pull-card-transition":
      return <iframe className={styles.pullFrame} src={PULL_CARD_PREVIEW_PATH} title="Interactive Home pull card" />;
  }
}
