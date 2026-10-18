"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { House } from "@phosphor-icons/react/dist/ssr/House";
import { PenNib } from "@phosphor-icons/react/dist/ssr/PenNib";
import { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type CSSProperties, type Ref, useEffect, useRef, useState } from "react";
import { CloudAvatar } from "@/components/ai/CloudAvatar";
import type { BloubExpressionId } from "@/components/ai/vendor/bloub/bloub";
import { track } from "@/lib/analytics";

// Home (the Gallery) on the left, Writing in the middle, Profile (the
// Experience list) on the right.
const tabs = [
  { href: "/", label: "Home", icon: House },
  { href: "/writing", label: "Writing", icon: PenNib },
  { href: "/profile", label: "Profile", icon: UserCircle },
];

const TAP_VOLUME = 0.5;


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
  const [tapped, setTapped] = useState<{ href: string; plays: number } | null>(null);
  const tapSound = useRef<HTMLAudioElement | null>(null);

  // On a detail page the bar contracts, Dynamic Island style, into one circle
  // holding the way back to the list the page belongs to.
  // A guided walkthrough (doc/hr-mode-plan.md) wears the same contracted bar,
  // but its circle is the way out of the walkthrough rather than a step back.
  const walkthrough = pathname.startsWith("/tour/");
  const detail = walkthrough || /^\/(work|writing)\/[^/]+/.test(pathname);
  const backHref = walkthrough
    ? "/"
    : pathname.startsWith("/writing/")
      ? "/writing"
      : "/profile";
  const backLabel = walkthrough
    ? "Exit walkthrough"
    : backHref === "/profile"
      ? "Back to Profile"
      : "Back to Writing";
  const tabsHidden = aiOpen || detail;

  // The arrow means "back to where I was": a gallery item returns to the
  // gallery, a row to its list. That is only safe as a real history step when
  // this detail page was pushed from a page of ours just now — otherwise (a
  // shared link, or arriving here with the browser's own back/forward) the
  // entry behind it may not be ours, and the arrow falls back to the list.
  const router = useRouter();
  const previousPath = useRef<string | null>(null);
  const poppedHistory = useRef(false);
  const [canStepBack, setCanStepBack] = useState(false);

  useEffect(() => {
    const onPop = () => {
      poppedHistory.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const previous = previousPath.current;
    const previousWasDetail =
      previous !== null && /^\/(work|writing)\/[^/]+/.test(previous);
    // Moving between entries of one detail page (the scroll tour replacing
    // the URL) keeps whatever the arrow already knew.
    if (!detail) setCanStepBack(false);
    else if (!previousWasDetail) {
      setCanStepBack(previous !== null && !poppedHistory.current);
    }
    poppedHistory.current = false;
    previousPath.current = pathname;
  }, [pathname, detail]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : href === "/profile"
        ? pathname.startsWith("/profile") || pathname.startsWith("/work/")
        : pathname.startsWith(href);

  // The pill slides to this column. Resolved during render, so the server sends
  // it already in place — there is no first-paint snap to suppress.
  const activeIndex = tabs.findIndex((tab) => isActive(tab.href));

  useEffect(() => {
    const audio = new Audio("/sounds/tap.wav");
    audio.preload = "auto";
    audio.volume = TAP_VOLUME;
    tapSound.current = audio;
    return () => {
      tapSound.current = null;
    };
  }, []);

  function tap(href: string) {
    const audio = tapSound.current;
    if (audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => {});
    }
    setTapped((previous) => ({
      href,
      plays: (previous?.href === href ? previous.plays : 0) + 1,
    }));
    onNavigate();
  }

  return (
    <>
      <div
        className="site-content-mask"
        data-ai-open={aiOpen ? "true" : "false"}
        aria-hidden="true"
      />
      <div
        className="site-dock-row"
        data-ai-open={aiOpen ? "true" : "false"}
        data-detail={detail ? "true" : "false"}
        style={
          {
            "--dock-count": tabs.length,
            "--dock-active": Math.max(activeIndex, 0),
          } as CSSProperties
        }
      >
        <div className="site-dock-shadow">
          {/* Capsules, so no squircle: at radius = half the height there is no
              corner left to smooth, and a clip path would disagree with the
              border-radius the inset rim and bevel are drawn against. */}
          <nav
            className="site-dock navigation-surface"
            aria-label="Portfolio sections"
            data-has-active={activeIndex === -1 ? "false" : "true"}
          >
            {/* One pill for the whole bar, not a surface per tab: it travels
                between columns so the recess slides rather than jumps. */}
            <div className="site-dock-pill" aria-hidden="true" />
            {tabs.map((tab) => {
              const active = isActive(tab.href);
              const Icon = tab.icon;
              const hopping = tapped?.href === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  aria-hidden={tabsHidden ? "true" : undefined}
                  tabIndex={tabsHidden ? -1 : undefined}
                  className="site-dock-tab press-shrink"
                  data-active={active ? "true" : "false"}
                  onClick={() => tap(tab.href)}
                >
                  {/* The tap hop used to run letter by letter across the label.
                      With the label gone the icon carries it, so a tap still
                      answers in the same voice. Remounting on `plays` restarts
                      the animation for repeated taps. */}
                  <span
                    key={hopping ? tapped?.plays : 0}
                    className={hopping ? "site-dock-icon tab-hop" : "site-dock-icon"}
                    aria-hidden="true"
                  >
                    <Icon size={20} weight="regular" />
                  </span>
                  <span className="sr-only">{tab.label}</span>
                </Link>
              );
            })}
            <Link
              href={backHref}
              aria-hidden={detail && !aiOpen ? undefined : "true"}
              tabIndex={detail && !aiOpen ? undefined : -1}
              className="site-dock-back press-shrink"
              onClick={(event) => {
                tap(backHref);
                if (walkthrough) {
                  track("tour_exited", { focus: pathname.slice(6) });
                } else if (canStepBack) {
                  event.preventDefault();
                  router.back();
                }
              }}
            >
              <span
                key={tapped?.href === backHref ? tapped.plays : 0}
                className={
                  tapped?.href === backHref && detail
                    ? "site-dock-icon tab-hop"
                    : "site-dock-icon"
                }
                aria-hidden="true"
              >
                {walkthrough ? (
                  <X size={20} weight="regular" />
                ) : (
                  <ArrowLeft size={20} weight="regular" />
                )}
              </span>
              <span className="sr-only">
                {canStepBack && !walkthrough ? "Back" : backLabel}
              </span>
            </Link>
          </nav>
        </div>
        <div className="ai-trigger-shell">
          {/* A true circle, so no squircle: at radius = half the width there is
              no corner left to smooth. */}
          <div className="ai-trigger-surface navigation-surface" aria-hidden="true" />
          <button
            ref={triggerRef}
            type="button"
            className="ai-trigger"
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
