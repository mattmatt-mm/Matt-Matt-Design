"use client";

import { useEffect, useState } from "react";
import { SelectMenu } from "@/components/SelectMenu";
import {
  THEME_COLORS,
  THEME_COLOR_META_ID,
  THEME_STORAGE_KEY,
  TYPEFACE_STORAGE_KEY,
} from "@/lib/site-appearance";

const typefaces = [
  { value: "allo", label: "Allo", className: "font-site-allo" },
  { value: "helvetica", label: "Helvetica Neue", className: "font-site-helvetica" },
] as const;

const themes = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

type Typeface = (typeof typefaces)[number]["value"];
type Theme = (typeof themes)[number]["value"];

function savePreference(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // The current page can still apply preferences when storage is unavailable.
  }
}

export function AppearanceSettings() {
  const [typeface, setTypeface] = useState<Typeface>("allo");
  const [theme, setTheme] = useState<Theme>("auto");

  useEffect(() => {
    const { siteTypeface, siteTheme } = document.documentElement.dataset;
    if (siteTypeface === "helvetica") setTypeface(siteTypeface);
    if (siteTheme === "light" || siteTheme === "dark") setTheme(siteTheme);
  }, []);

  function selectTypeface(value: Typeface) {
    const { dataset } = document.documentElement;
    if (value === "helvetica") dataset.siteTypeface = value;
    else delete dataset.siteTypeface;
    setTypeface(value);
    savePreference(TYPEFACE_STORAGE_KEY, value === "allo" ? null : value);
  }

  function selectTheme(value: Theme) {
    const { dataset } = document.documentElement;
    if (value === "auto") delete dataset.siteTheme;
    else dataset.siteTheme = value;

    const meta = document.querySelector<HTMLMetaElement>(`#${THEME_COLOR_META_ID}`);
    if (meta) {
      meta.content = value === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;
      meta.media = value === "auto" ? "not all" : "all";
    }
    setTheme(value);
    savePreference(THEME_STORAGE_KEY, value === "auto" ? null : value);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
        <span>Typeface</span>
        <div className="w-48 min-w-0">
          <SelectMenu label="Typeface" options={typefaces} value={typeface} onChange={selectTypeface} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span>Theme</span>
        <div className="w-48 min-w-0">
          <SelectMenu label="Theme" options={themes} value={theme} onChange={selectTheme} />
        </div>
      </div>
    </div>
  );
}
