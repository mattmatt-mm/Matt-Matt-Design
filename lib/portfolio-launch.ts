export const PORTFOLIO_LAUNCH_END = "mmd:portfolio-launch-end";
export const PULL_CARD_PREVIEW_PATH = "/components/pull-card-transition/preview";
const HYDRATION_DEADLINE_MS = 10_000;

// The head script runs on document loads, before hydration. Client-side
// navigation back to Home doesn't run it again.
export const preparePortfolioLaunch = `if (location.pathname === "/" || location.pathname === ${JSON.stringify(PULL_CARD_PREVIEW_PATH)}) {
  const root = document.documentElement;
  root.dataset.portfolioLaunch = "pending";
  window.setTimeout(() => {
    if (root.dataset.portfolioLaunch !== "pending") return;
    delete root.dataset.portfolioLaunch;
    window.dispatchEvent(new Event(${JSON.stringify(PORTFOLIO_LAUNCH_END)}));
  }, ${HYDRATION_DEADLINE_MS});
}`;

export function endPortfolioLaunch() {
  const { dataset } = document.documentElement;
  if (!dataset.portfolioLaunch) return;
  delete dataset.portfolioLaunch;
  window.dispatchEvent(new Event(PORTFOLIO_LAUNCH_END));
}
