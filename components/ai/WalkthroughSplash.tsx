"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export type SplashRun = {
  /** The Start walkthrough button, which swells and dissolves as it goes. */
  button: HTMLElement;
  eyebrow: string;
  titles: string[];
  href: string;
};

/*
 * The timeline, in ms from the tap. ~2.4s end to end, chosen by Matt on
 * 2026-10-18; see doc/hr-mode-plan.md.
 */
/** The page background fades up over the whole screen. */
const COVER = 500;
/** The pressed button swells a little, blurs and fades, in the same breath. */
const BUTTON_EXIT = 450;
const BUTTON_SCALE = 1.08;
const BUTTON_BLUR = "8px";
const LINES_FROM = 200;
const LINE_STEP = 90;
const LINE_DUR = 500;
const HANDOFF_AT = 1800;
const REVEAL = 600;
const EXIT = 300;
/** How long to wait for the walkthrough page before revealing regardless. */
const PAGE_WAIT = 3000;
/** The soft band at the bottom edge of the wipe. Matches the mask's 80px halves. */
const FEATHER = 160;

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const HIDDEN = { opacity: 0, transform: "translateY(12px)", filter: "blur(3px)" };
const SHOWN = { opacity: 1, transform: "translateY(0)", filter: "blur(0)" };

/**
 * Pressing Start walkthrough: the button swells, blurs and fades away while
 * the page background fades up over everything and the walkthrough's titles
 * rise in on the page column,
 * then the sheet wipes upward to uncover the walkthrough while its eyebrow and
 * first title glide onto the page's own. A tap or Escape skips to the reveal.
 * The walkthrough page loads underneath as soon as the screen is covered.
 */
export function WalkthroughSplash({
  run,
  onCovered,
  onDone,
}: {
  run: SplashRun;
  /** The screen is covered and the walkthrough is on its way underneath. */
  onCovered: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const layer = root.current;
    const cover = sheet.current;
    const list = lines.current;
    if (!layer || !cover || !list) return;

    const timers: number[] = [];
    let navigated = false;
    let handedOff = false;
    let finished = false;

    const navigate = () => {
      if (navigated) return;
      navigated = true;
      // Changing the picks can land on the walkthrough already open: no route
      // change, so start it from the top here instead.
      if (window.location.pathname === run.href) window.scrollTo(0, 0);
      else router.push(run.href);
      onCovered();
    };

    cover
      .animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: COVER,
        easing: EASE,
        fill: "forwards",
      })
      .finished.then(navigate, navigate);

    // The button has to stay above the fading sheet to be seen leaving, but it
    // lives in the AI layer beneath it. A copy takes its exact place up here
    // (squircle clip path and all) and the original steps out of sight.
    const pressed = run.button;
    const rect = pressed.getBoundingClientRect();
    const ghost = pressed.cloneNode(true) as HTMLElement;
    ghost.classList.add("walkthrough-splash-button");
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    layer.append(ghost);
    pressed.style.setProperty("visibility", "hidden");
    ghost.animate(
      [
        { transform: "scale(1)", filter: "blur(0)" },
        { transform: `scale(${BUTTON_SCALE})`, filter: `blur(${BUTTON_BLUR})` },
      ],
      { duration: BUTTON_EXIT, easing: EASE, fill: "forwards" },
    );
    // Its own, gentler curve: on the shared ease-out it was mostly gone before
    // the swell could be seen.
    ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: BUTTON_EXIT,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "forwards",
    });

    const items = [...list.children] as HTMLElement[];
    items.forEach((item, i) => {
      item.animate([HIDDEN, SHOWN], {
        duration: LINE_DUR,
        delay: LINES_FROM + i * LINE_STEP,
        easing: EASE,
        fill: "both",
      });
    });

    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    const pageReady = () =>
      new Promise<{ eyebrow: HTMLElement; title: HTMLElement } | null>(
        (resolve) => {
          const started = performance.now();
          const look = () => {
            const eyebrow = document.querySelector<HTMLElement>(
              '[data-splash-target="eyebrow"]',
            );
            const title = document.querySelector<HTMLElement>(
              '[data-splash-target="title"]',
            );
            if (window.location.pathname === run.href && eyebrow && title) {
              resolve({ eyebrow, title });
            } else if (performance.now() - started > PAGE_WAIT) {
              resolve(null);
            } else {
              requestAnimationFrame(look);
            }
          };
          look();
        },
      );

    const handOff = async () => {
      if (handedOff) return;
      handedOff = true;
      navigate();
      layer.dataset.revealing = "true";
      const targets = await pageReady();
      if (finished) return;
      const [eyebrowLine, titleLine, ...rest] = items;

      // Hidden until the gliding copies arrive, so the wipe never uncovers a
      // second eyebrow and title beneath the moving ones.
      targets?.eyebrow.style.setProperty("opacity", "0");
      targets?.title.style.setProperty("opacity", "0");

      const wipe = cover.animate(
        {
          maskPosition: ["0 0%", "0 100%"],
          WebkitMaskPosition: ["0 0%", "0 100%"],
        } as PropertyIndexedKeyframes,
        { duration: REVEAL, easing: EASE, fill: "forwards" },
      );

      const exit = [
        SHOWN,
        { opacity: 0, transform: "translateY(-8px)", filter: "blur(3px)" },
      ];
      rest.forEach((item, i) => {
        item.animate(exit, {
          duration: EXIT,
          delay: i * 30,
          easing: EASE,
          fill: "forwards",
        });
      });

      const glide = (line: HTMLElement, target: HTMLElement | undefined) => {
        if (!target) {
          line.animate(exit, { duration: EXIT, easing: EASE, fill: "forwards" });
          return;
        }
        const from = line.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const scale =
          parseFloat(getComputedStyle(target).fontSize) /
          parseFloat(getComputedStyle(line).fontSize);
        line.animate(
          [
            { transform: "translate(0, 0) scale(1)" },
            {
              transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`,
            },
          ],
          { duration: REVEAL, easing: EASE, fill: "forwards" },
        );
        // The page's own line takes over as the copy lands, so a heading
        // that wraps differently from its splash copy never jumps. Both fades
        // run on one plain clock of their own: on the glide's eased curve the
        // copy would be gone well before the page's line arrived.
        const handover = {
          duration: REVEAL * 0.35,
          delay: REVEAL * 0.65,
          easing: "linear",
          fill: "both" as const,
        };
        line.animate([{ opacity: 1 }, { opacity: 0 }], handover);
        target
          .animate([{ opacity: 0 }, { opacity: 1 }], handover)
          .finished.then(() => {
            target.style.removeProperty("opacity");
          });
      };
      glide(eyebrowLine, targets?.eyebrow);
      glide(titleLine, targets?.title);

      wipe.finished.then(finish, finish);
    };

    timers.push(window.setTimeout(handOff, HANDOFF_AT));
    skip.current = () => void handOff();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip.current();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      timers.forEach(window.clearTimeout);
      ghost.remove();
      pressed.style.removeProperty("visibility");
      window.removeEventListener("keydown", onKey);
      document
        .querySelectorAll<HTMLElement>("[data-splash-target]")
        .forEach((el) => el.style.removeProperty("opacity"));
    };
    // One run per mount: AIExperience keys this component by run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      className="walkthrough-splash"
      style={{ "--splash-feather": `${FEATHER}px` } as React.CSSProperties}
      onClick={() => skip.current()}
    >
      <div ref={sheet} className="walkthrough-splash-sheet" aria-hidden="true" />
      <div className="walkthrough-splash-column">
        <div ref={lines} role="status">
          <p className="text-muted">{run.eyebrow}</p>
          {run.titles.map((title) => (
            <p key={title}>{title}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
