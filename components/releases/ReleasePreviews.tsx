import { SiteSquircle } from "@/components/SiteSquircle";
import type { ReleasePreview } from "@/lib/releases";
import { ReleaseScene } from "./ReleaseScenes";
import styles from "./ReleasePreviews.module.css";

export function ReleasePreviews({ previews }: { previews: readonly ReleasePreview[] }) {
  return (
    <ul className={styles.grid} aria-label="Component interaction previews">
      {previews.map(({ slug, title }) => (
        <li key={slug} className={styles.tile} data-preview={slug}>
          <SiteSquircle className={styles.frame} role="img" aria-label={title}>
            <div aria-hidden="true" inert>
              <ReleaseScene slug={slug} />
            </div>
          </SiteSquircle>
        </li>
      ))}
    </ul>
  );
}
