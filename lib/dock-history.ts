const BACK_ENTRY = "mmd:dock-back";
const HISTORY_CHANGE = "mmd:dock-history-change";

type BackEntry = { path: string; steps: number };

// Install before Next wraps the History API so its own pushes and replacements
// pass through here too. Store the return target on the entry that owns it.
export const prepareDockHistory = `(() => {
  const key = ${JSON.stringify(BACK_ENTRY)};
  const changed = ${JSON.stringify(HISTORY_CHANGE)};
  const { history } = window;
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  const notify = () => queueMicrotask(() => window.dispatchEvent(new Event(changed)));

  history.pushState = (data, unused, url) => {
    const destination = url == null ? location : new URL(url, location.href);
    const previous = history.state?.[key];
    let back = null;
    if (destination.pathname !== location.pathname) {
      back = { path: location.pathname, steps: 1 };
    } else if (previous) {
      back = { ...previous, steps: previous.steps + 1 };
    }
    push({ ...data, [key]: back }, unused, url);
    notify();
  };

  history.replaceState = (data, unused, url) => {
    replace({ ...data, [key]: history.state?.[key] ?? null }, unused, url);
    notify();
  };
})();`;

export function dockBackSteps() {
  const recorded = window.history.state?.[BACK_ENTRY] as BackEntry | null | undefined;
  if (recorded) return recorded.steps;

  // A native fragment click or a full document load may have no site marker.
  // Available browser entries can still prove that the previous page is ours.
  const { navigation } = window as Window & {
    navigation?: {
      currentEntry: { index: number } | null;
      entries(): { url: string | null }[];
    };
  };
  if (!navigation?.currentEntry) return 0;

  const current = navigation.currentEntry.index;
  const entries = navigation.entries();
  for (let index = current - 1; index >= 0; index--) {
    const entry = entries[index];
    if (!entry?.url) break;
    const previous = new URL(entry.url);
    if (previous.origin !== window.location.origin) break;
    if (previous.pathname !== window.location.pathname) return current - index;
  }
  return 0;
}

export function subscribeToDockHistory(onChange: () => void) {
  const events = [HISTORY_CHANGE, "popstate", "hashchange", "pageshow"];
  for (const event of events) window.addEventListener(event, onChange);
  return () => {
    for (const event of events) window.removeEventListener(event, onChange);
  };
}

export const noDockBackSteps = () => 0;
