"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { Sparkle } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type CSSProperties,
  type Ref,
  startTransition,
  useEffect,
  useOptimistic,
  useRef,
  useSyncExternalStore,
} from "react";
import { CloudAvatar } from "@/components/ai/CloudAvatar";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";
import { useDockDrag } from "@/components/library/useDockDrag";
import { track } from "@/lib/analytics";
import { dockBackSteps, noDockBackSteps, subscribeToDockHistory } from "@/lib/dock-history";
import { letsWorkPath, profilePath, profileTitle } from "@/lib/site";

const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/writing", label: "Writing", icon: PenNib },
  { href: "/fun", label: "Fun", icon: Sparkle },
  { href: "/browse", label: "Browse", icon: MagnifyingGlass },
];

const TAP_VOLUME = 0.5;

const CONTENT_DETAIL = /^\/(work|writing|fun)\/[^/]+/;

export function AiDock({
  aiOpen,
  expression,
  onOpen,
  onNavigate,
  triggerRef,
}: {
  aiOpen: boolean;
  expression: BloubExpressionId;
  onOpen: () => void;
  onNavigate: () => void;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const pathname = usePathname();
  const tapSound = useRef<HTMLAudioElement | null>(null);

  // Detail pages use compact navigation. A walkthrough has a single exit.
  const walkthrough = pathname.startsWith("/tour/");
  const browseSubpage = pathname.startsWith("/browse/");
  const letsWork = pathname === letsWorkPath;
  const componentDetail = pathname.startsWith("/components/");
  const detail = walkthrough || browseSubpage || letsWork || componentDetail || CONTENT_DETAIL.test(pathname);
  const [backHref, backLabel] = walkthrough
    ? ["/", "Exit walkthrough"]
    : letsWork
      ? ["/", "Back to Home"]
      : componentDetail
        ? ["/components", "Back to Components"]
        : browseSubpage
          ? ["/browse", "Back to Browse"]
          : pathname.startsWith("/writing/")
            ? ["/writing", "Back to Writing"]
            : pathname.startsWith("/fun/")
              ? ["/fun", "Back to Fun"]
              : [profilePath, `Back to ${profileTitle}`];
  const tabsHidden = aiOpen || detail;

  const router = useRouter();
  const backSteps = useSyncExternalStore(subscribeToDockHistory, dockBackSteps, noDockBackSteps);
  const compactHidden = !detail || aiOpen;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  // The pill slides to this column. Resolved during render, so the server sends
  // it already in place — there is no first-paint snap to suppress.
  const activeIndex = tabs.findIndex((tab) => isActive(tab.href));
  const [pillIndex, previewDrop] = useOptimistic(activeIndex);

  const { pillRef, dragHandlers } = useDockDrag(tabs.length, activeIndex, tabsHidden, pathname, (index) => {
    tap();
    startTransition(() => {
      previewDrop(index);
      router.push(tabs[index].href);
    });
  });

  useEffect(() => {
    const audio = new Audio("/sounds/tap.wav");
    audio.preload = "auto";
    audio.volume = TAP_VOLUME;
    tapSound.current = audio;
    return () => {
      tapSound.current = null;
    };
  }, []);

  function tap() {
    const audio = tapSound.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }
    onNavigate();
  }

  return (
    <>
      <div
        className="site-content-mask"
        data-ai-open={aiOpen ? "true" : "false"}
        aria-hidden="true"
      >
        {/* The blur layers share the fade's curve behind the dock and chat. */}
        {[1, 2, 3, 4].map((step) => (
          <span key={step} className="site-content-blur" data-step={step} />
        ))}
        <span className="site-content-fade" />
      </div>
      <div
        className="site-dock-row"
        data-ai-open={aiOpen ? "true" : "false"}
        data-detail={detail ? "true" : "false"}
        data-walkthrough={walkthrough ? "true" : undefined}
        style={
          {
            "--dock-count": tabs.length,
            "--dock-active": Math.max(pillIndex, 0),
          } as CSSProperties
        }
      >
        <div className="site-dock-shadow">
          {/* Capsules, so no squircle: at radius = half the height there is no
              corner left to smooth, and a clip path would disagree with the
              border-radius the inset rim and bevel are drawn against. */}
          <nav
            className="site-dock"
            aria-label="Portfolio sections"
            aria-hidden={aiOpen || undefined}
            data-has-active={activeIndex === -1 ? "false" : "true"}
            {...dragHandlers}
          >
            {/* One pill for the whole bar, not a surface per tab: it travels
                between columns so the recess slides rather than jumps. */}
            <div ref={pillRef} className="site-dock-pill" aria-hidden="true" />
            <div className="site-dock-compact" inert={compactHidden} aria-hidden={compactHidden || undefined}>
              <Link
                href={backHref}
                replace={!walkthrough}
                className="site-dock-compact-control press-shrink"
                onClick={(event) => {
                  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  tap();
                  if (walkthrough) {
                    track("tour_exited", { focus: pathname.slice(6) });
                    return;
                  }
                  const steps = dockBackSteps();
                  if (steps > 0) {
                    event.preventDefault();
                    window.history.go(-steps);
                  }
                }}
              >
                <span className="site-dock-icon" aria-hidden="true">
                  {walkthrough ? <X size={20} /> : <ArrowLeft size={20} />}
                </span>
                <span className="sr-only">{backSteps > 0 && !walkthrough ? "Back" : backLabel}</span>
              </Link>
              {!walkthrough && (
                <Link href="/" className="site-dock-compact-control press-shrink" onClick={tap}>
                  <span className="site-dock-icon" aria-hidden="true"><House size={20} /></span>
                  <span className="sr-only">Home</span>
                </Link>
              )}
            </div>
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? (pathname === tab.href ? "page" : "location") : undefined}
                  aria-hidden={tabsHidden ? "true" : undefined}
                  tabIndex={tabsHidden ? -1 : undefined}
                  className="site-dock-tab press-shrink"
                  data-dock-tab=""
                  data-active={active ? "true" : "false"}
                  draggable={active ? false : undefined}
                  onClick={tap}
                >
                  <span className="site-dock-icon" aria-hidden="true">
                    <Icon size={20} weight="regular" />
                  </span>
                  <span className="sr-only">{tab.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="ai-trigger-shell">
          {/* A true circle, so no squircle: at radius = half the width there is
              no corner left to smooth. */}
          <div className="ai-trigger-surface navigation-surface" aria-hidden="true" />
          <button
            ref={triggerRef}
            type="button"
            className="ai-trigger press-shrink"
            aria-label="Ask Matt's AI"
            aria-hidden={aiOpen ? "true" : undefined}
            tabIndex={aiOpen ? -1 : 0}
            disabled={aiOpen}
            onClick={onOpen}
          >
            <CloudAvatar expression={expression} />
          </button>
        </div>
      </div>
    </>
  );
}
