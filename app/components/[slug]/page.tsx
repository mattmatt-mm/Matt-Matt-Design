import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { JsonLd } from "@/components/JsonLd";
import { ComponentExample } from "@/components/library/ComponentExample";
import { CopyableCode, CopyLibraryText, LibraryInstall, LibraryLab, LibrarySource } from "@/components/library/LibraryLab";
import {
  componentCatalog,
  componentPageMetadata,
  componentsPath,
  getLibraryModule,
  libraryRegistryPath,
} from "@/lib/component-library";
import { getLibrarySource } from "@/lib/component-library-source";
import { siteUrl } from "@/lib/site";
import { componentSchema } from "@/lib/structured-data";
import styles from "@/components/library/Library.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return componentCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const component = getLibraryModule((await params).slug);
  if (!component) return {};
  return componentPageMetadata(component.searchTitle, component.description, `${componentsPath}/${component.slug}`);
}

export default async function ComponentPage({ params }: Props) {
  const component = getLibraryModule((await params).slug);
  if (!component) notFound();
  const files = "installDependencies" in component ? await getLibrarySource(component.slug) : [];

  return (
    <main className={`${styles.layout} ${styles.detail}`}>
      <JsonLd data={componentSchema(component, files.length > 0)} />
      <Link href={componentsPath} className={styles.back}><ArrowLeft size={16} aria-hidden /> Components</Link>
      <header className={styles.header}>
        <div>
          <h1 className="text-title">{component.title}</h1>
          <p>{component.description}</p>
        </div>
        <CopyLibraryText text={component.prompt} label="Copy prompt" />
      </header>
      <LibraryLab resettable={component.slug !== "notes"} instruction={component.instruction} codeLayout="inline">
        <ComponentExample component={component} />
      </LibraryLab>
      {component.slug === "pull-card-transition" ? (
        <section className={styles.spec} aria-label="Usage">
          <h2 className="text-section font-bold">Usage</h2>
          <p>Add <a href="https://reactbits.dev/components/lanyard">React Bits Lanyard</a> to your project and pass in your badge artwork. This example uses Matt’s badge and strap settings.</p>
          <CopyableCode title="PortfolioBadge.tsx" text={component.usage} />
          <p>On <Link href={component.exampleHref}>Home</Link>, the badge also reports pull progress to the portfolio’s reveal animation.</p>
        </section>
      ) : (
        <>
          <section className={styles.spec} aria-label="Install">
            <h2 className="text-section font-bold">Install</h2>
            <LibraryInstall canonicalOrigin={siteUrl} registryPath={libraryRegistryPath(component.slug)} dependencies={component.installDependencies} />
            <p>For manual setup, install the dependencies and copy the source files into your project’s <code>components/{component.slug}</code> folder.</p>
          </section>
          <section className={styles.spec} aria-label="Usage">
            <h2 className="text-section font-bold">Usage</h2>
            <CopyableCode title={component.title} text={component.usage} />
            <p>{component.dependencies}</p>
            <Link href={component.exampleHref}>See it in use</Link>
          </section>
          <section className={`${styles.spec} ${styles.sourceSpec}`} aria-label="Source">
            <h2 className="text-section font-bold">Source</h2>
            <LibrarySource files={files} />
          </section>
          <section className={`${styles.spec} ${styles.sourceSpec}`} aria-label="Props">
            <h2 className="text-section font-bold">Props</h2>
            <table className={styles.propsTable}>
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {component.props.map(({ name, type, defaultValue, description }) => (
                  <tr key={name}>
                    <th scope="row"><code>{name}</code></th>
                    <td><code>{type}</code></td>
                    <td><code>{defaultValue}</code></td>
                    <td>{description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </main>
  );
}
