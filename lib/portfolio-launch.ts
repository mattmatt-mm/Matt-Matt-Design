const ENTERED_KEY = "mmd:portfolio-entered-v1";
export const PORTFOLIO_LAUNCH_END = "mmd:portfolio-launch-end";

// Runs before the first render so the launch loader can appear before hydration.
export const preparePortfolioLaunch = `try {
  if (!sessionStorage.getItem(${JSON.stringify(ENTERED_KEY)})) {
    if (location.pathname === "/" && !location.search && !location.hash) {
      const root = document.documentElement;
      root.dataset.portfolioLaunch = "pending";
      window.setTimeout(() => {
        if (root.dataset.portfolioLaunch !== "pending") return;
        delete root.dataset.portfolioLaunch;
        window.dispatchEvent(new Event(${JSON.stringify(PORTFOLIO_LAUNCH_END)}));
      }, 2500);
    } else {
      sessionStorage.setItem(${JSON.stringify(ENTERED_KEY)}, "1");
    }
  }
} catch {}`;

export function rememberPortfolioEntry() {
  try {
    sessionStorage.setItem(ENTERED_KEY, "1");
  } catch {
    // Visitors can still enter when session storage is unavailable.
  }
}

export function endPortfolioLaunch() {
  const { dataset } = document.documentElement;
  if (!dataset.portfolioLaunch) return;
  delete dataset.portfolioLaunch;
  window.dispatchEvent(new Event(PORTFOLIO_LAUNCH_END));
}
