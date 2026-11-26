import { readFile } from "node:fs/promises";
import path from "node:path";
import type { InstallableModule, SourceFile } from "./component-library";

const sources: Record<InstallableModule["slug"], { directory: string; files: string[] }> = {
  notes: { directory: "components", files: ["Notes.tsx", "notes.css", "SiteSquircle.tsx"] },
  "dynamic-dock": { directory: "components/library", files: ["DynamicDock.tsx", "DynamicDock.module.css", "useDockDrag.ts"] },
  flipbook: { directory: "components/photobook", files: ["Photobook.tsx", "Photobook.module.css", "page-fold.ts"] },
};

export function getLibrarySource(slug: InstallableModule["slug"]): Promise<SourceFile[]> {
  const { directory, files } = sources[slug];
  return Promise.all(files.map(async (name) => ({
    name,
    text: await readFile(path.join(process.cwd(), directory, name), "utf8"),
  })));
}
