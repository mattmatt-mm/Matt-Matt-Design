"use client";

import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr/ArrowClockwise";
import { CaretDown } from "@phosphor-icons/react/dist/ssr/CaretDown";
import { Check } from "@phosphor-icons/react/dist/ssr/Check";
import { Copy } from "@phosphor-icons/react/dist/ssr/Copy";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SITE_SQUIRCLE_RADIUS, SiteSquircle } from "@/components/SiteSquircle";
import type { SourceFile } from "@/lib/component-library";
import styles from "./Library.module.css";

const LAB_INSET = 8;
const LAB_INNER_RADIUS = SITE_SQUIRCLE_RADIUS - LAB_INSET;
const TAB_GROUP_INSET = 4;
const TAB_RADIUS = LAB_INNER_RADIUS - TAB_GROUP_INSET;
const LAB_VIEWS = [
  { label: "Preview", code: false },
  { label: "Code", code: true },
];

export function CopyLibraryText({ text, label, context }: { text: string; label: string; context?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number>(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), 2400);
  }

  const caption = status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : label;

  return (
    <button type="button" className={`${styles.action} press-shrink`} onClick={copy}>
      {status === "copied" ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
      <span aria-live="polite">{caption}{context && <span className="sr-only"> for {context}</span>}</span>
    </button>
  );
}

export function CopyableCode({ title, text }: { title: string; text: string }) {
  return (
    <div className={styles.sourceFile}>
      <SiteSquircle className={styles.labSurface} aria-hidden />
      <div className={styles.codeToolbar}>
        <span>{title}</span>
        <CopyLibraryText text={text} label="Copy" context={title} />
      </div>
      <SiteSquircle asChild cornerRadius={LAB_INNER_RADIUS}>
        <pre className={styles.codeBlock}><code>{text}</code></pre>
      </SiteSquircle>
    </div>
  );
}

export function LibraryInstall({ canonicalOrigin, registryPath, dependencies }: {
  canonicalOrigin: string;
  registryPath: string;
  dependencies: readonly string[];
}) {
  const [origin, setOrigin] = useState(canonicalOrigin);
  useEffect(() => setOrigin(window.location.origin), []);
  const manualPackages = dependencies.map((dependency) => `"${dependency}"`).join(" ");

  return (
    <div className={styles.sourceFiles}>
      <CopyableCode title="Registry" text={`npx shadcn@latest add ${origin}${registryPath}`} />
      <CopyableCode title="Manual dependencies" text={`npm install ${manualPackages}`} />
    </div>
  );
}

export function LibrarySource({ files }: { files: readonly SourceFile[] }) {
  return (
    <div className={styles.sourceFiles}>
      {files.map(({ name, text }) => (
        <div key={name} className={styles.sourceFile}>
          <SiteSquircle className={styles.labSurface} aria-hidden />
          <div className={styles.codeToolbar}>
            <code className={styles.fileTitle}>{name}</code>
            <CopyLibraryText text={text} label="Copy code" context={name} />
          </div>
          <details className={styles.codeDisclosure}>
            <summary className={styles.codeSummary}>
              <SiteSquircle asChild cornerRadius={LAB_INNER_RADIUS}>
                <span className={styles.codeTeaser} aria-hidden="true">
                  <code>{text.split("\n", 4).join("\n")}</code>
                </span>
              </SiteSquircle>
              <span className={`${styles.action} ${styles.codeToggle}`}>
                <span className={styles.viewCode}>View code</span>
                <span className={styles.hideCode}>Hide code</span>
                <span className="sr-only"> for {name}</span>
                <CaretDown size={16} aria-hidden />
              </span>
            </summary>
            <SiteSquircle asChild cornerRadius={LAB_INNER_RADIUS}>
              <pre className={styles.codeBlock} aria-label={name}><code>{text}</code></pre>
            </SiteSquircle>
          </details>
        </div>
      ))}
    </div>
  );
}

export function LibraryLab({ children, files = [], resettable, instruction, codeLayout = "tabs" }: {
  children: ReactNode;
  files?: readonly SourceFile[];
  resettable: boolean;
  instruction: string;
  codeLayout?: "tabs" | "inline";
}) {
  const [showCode, setShowCode] = useState(false);
  const [revision, setRevision] = useState(0);
  const inline = codeLayout === "inline";
  const showPreview = inline || !showCode;

  return (
    <div className={styles.lab} style={{ "--lab-inset": `${LAB_INSET}px` } as CSSProperties}>
      <SiteSquircle className={styles.labSurface} aria-hidden />
      {(!inline || resettable) && (
        <div className={styles.toolbar}>
          {!inline && (files.length ? (
            <div className={styles.mode} style={{ padding: TAB_GROUP_INSET }} role="group" aria-label="Display">
              <SiteSquircle className={styles.modeSurface} cornerRadius={LAB_INNER_RADIUS} aria-hidden />
              {LAB_VIEWS.map(({ label, code }) => (
                <button
                  key={label}
                  type="button"
                  className={styles.modeTab}
                  aria-pressed={showCode === code}
                  onClick={() => setShowCode(code)}
                >
                  <SiteSquircle asChild cornerRadius={TAB_RADIUS}>
                    <span className={styles.modeTabSurface}>{label}</span>
                  </SiteSquircle>
                </button>
              ))}
            </div>
          ) : <span className={styles.modeLabel}>Preview</span>)}
          {showPreview && resettable && (
            <button type="button" className={`${styles.action} ${styles.reset} press-shrink`} onClick={() => setRevision((current) => current + 1)}>
              <ArrowClockwise size={18} aria-hidden /> Reset
            </button>
          )}
        </div>
      )}
      <div className={styles.preview} hidden={!showPreview}>
        <div key={revision}>{children}</div>
        <p className={styles.instruction}>{instruction}</p>
      </div>
      {(inline || showCode) && files.length > 0 && (
        <div className={styles.labSource}>
          <LibrarySource files={files} />
        </div>
      )}
    </div>
  );
}
