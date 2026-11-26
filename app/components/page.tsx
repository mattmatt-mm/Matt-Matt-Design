import Image from "next/image";
import Link from "next/link";
import { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { JsonLd } from "@/components/JsonLd";
import { SiteSquircle } from "@/components/SiteSquircle";
import {
  componentCatalog,
  componentLibraryDescription,
  componentLibraryTitle,
  componentPageMetadata,
  componentsPath,
  type ModuleSlug,
} from "@/lib/component-library";
import { componentCatalogSchema } from "@/lib/structured-data";
import styles from "@/components/library/Library.module.css";
import bookStyles from "@/components/photobook/Photobook.module.css";

export const metadata = componentPageMetadata(componentLibraryTitle, componentLibraryDescription, componentsPath);

function ModuleStill({ slug }: { slug: ModuleSlug }) {
  switch (slug) {
    case "notes":
      return <SiteSquircle className={styles.noteThumb}><span>Recipe <Copy size={18} /></span></SiteSquircle>;
    case "dynamic-dock":
      return <div className={`${styles.dockThumb} navigation-surface`}>
        {[House, PenNib, Sparkle, MagnifyingGlass].map((Icon, index) => <span key={index}><Icon size={20} /></span>)}
      </div>;
    case "flipbook":
      return <div className={styles.bookThumb}>
        <Image src="/images/components/flipbook/page-2.webp" width={600} height={848} alt="" sizes="160px" />
        <Image src="/images/components/flipbook/page-3.webp" width={600} height={848} alt="" sizes="160px" />
        <span className={bookStyles.gutter} />
      </div>;
    case "pull-card-transition":
      return (
        <div className={`${styles.pullThumb} bg-[url('/images/components/pull-card-light.webp')] site-dark:bg-[url('/images/components/pull-card-dark.webp')]`} />
      );
  }
}

export default function ComponentsPage() {
  return (
    <main className={styles.layout}>
      <JsonLd data={componentCatalogSchema()} />
      <header className={styles.header}>
        <div>
          <h1 className="text-title">Components</h1>
          <p>{componentLibraryDescription}</p>
        </div>
      </header>
      <ul className={styles.grid} role="list">
        {componentCatalog.map(({ slug, title, group, description }) => (
          <li key={slug}>
            <Link href={`${componentsPath}/${slug}`} prefetch={false} className={`${styles.tile} press-shrink`}>
              <SiteSquircle className={styles.tilePicture} aria-hidden="true"><ModuleStill slug={slug} /></SiteSquircle>
              <div className={styles.caption}>
                <div className={styles.captionTop}>
                  <h2 className="text-section font-bold">{title}</h2>
                  <span className={styles.category}>{group}</span>
                </div>
                <p>{description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
