export const TYPEFACE_STORAGE_KEY = "mmd-site-typeface-v1";
export const THEME_STORAGE_KEY = "mmd-site-theme-v1";
export const THEME_COLOR_META_ID = "site-theme-color";
export const THEME_COLORS = { light: "#FDFDFC", dark: "#12110F" } as const;

// Restore browser preferences before paint while keeping routes static.
export const restoreAppearance = `try {
  const { dataset } = document.documentElement;
  if (localStorage.getItem(${JSON.stringify(TYPEFACE_STORAGE_KEY)}) === "helvetica") {
    dataset.siteTypeface = "helvetica";
  }
  const theme = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
  if (theme === "light" || theme === "dark") {
    dataset.siteTheme = theme;
    const themeColor = document.getElementById(${JSON.stringify(THEME_COLOR_META_ID)});
    if (themeColor) {
      themeColor.content = ${JSON.stringify(THEME_COLORS)}[theme];
      themeColor.media = "all";
    }
  }
} catch {}`;
