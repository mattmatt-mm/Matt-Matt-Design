"use client";

import {
  DistortionWave,
  snapshot,
  type CaptureFunction,
  type DistortionWaveHandle,
} from "distortion-waves";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { GRADIENT_FEATHER, gradientWave, gradientWipe, wipeGradientSheet } from "@/components/effects/gradient-reveal";

export type SplashRun = {
  /** The confirmation button, which swells and dissolves as it goes. */
  button: HTMLElement;
  eyebrow: string;
  titles: string[];
  href: string;
};

type SplashTargets = { eyebrow: HTMLElement; title: HTMLElement };

/** The pressed button swells a little, blurs and fades as the wave opens. */
const BUTTON_EXIT = 450;
const BUTTON_SCALE = 1.08;
const BUTTON_BLUR = "8px";
const LINES_FROM = 1050;
const LINE_STEP = 90;
const LINE_DUR = 500;
const HANDOFF_AT = 1800;
/** Let the library play even if a slow image delays the first snapshot. */
const CAPTURE_WAIT = 750;
const REVEAL = gradientWipe.duration;
const EXIT = 300;
/** How long to wait for the walkthrough page before revealing regardless. */
const PAGE_WAIT = 3000;
const EASE = gradientWipe.easing;
const HIDDEN = { opacity: 0, transform: "translateY(12px)", filter: "blur(3px)" };
const SHOWN = { opacity: 1, transform: "translateY(0)", filter: "blur(0)" };

function snapshotStyles(node: Element, overrides?: Record<string, string>) {
  // The snapshot can keep Tailwind's solid border style while omitting its
  // zero width. Copy the actual widths so the SVG also preserves real borders.
  return { "border-width": getComputedStyle(node).borderWidth, ...overrides };
}

function visibleLines(element: HTMLElement, bounds: DOMRect, lineHeight: string) {
  const text = element.textContent ?? "";
  const node = element.firstChild;
  if (!(node instanceof Text) || node !== element.lastChild || bounds.height <= parseFloat(lineHeight) + 1) return text;

  // Freeze the browser's actual line breaks so the proxy never reflows mid-glide.
  const range = document.createRange();
  let rowTop: number | undefined;
  let wrapped = "";
  let index = 0;
  for (const character of text) {
    range.setStart(node, index);
    index += character.length;
    range.setEnd(node, index);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0) {
      if (rowTop !== undefined && rect.top - rowTop > parseFloat(lineHeight) / 2) {
        wrapped = `${wrapped.trimEnd()}\n`;
      }
      rowTop = rect.top;
    }
    wrapped += character;
  }
  return wrapped;
}

function textFrame(bounds: DOMRect, style: CSSStyleDeclaration) {
  return {
    left: `${bounds.left}px`,
    top: `${bounds.top}px`,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing === "normal" ? "0px" : style.letterSpacing,
    fontWeight: style.fontWeight,
    color: style.color,
  };
}

function glideText(layer: HTMLElement, line: HTMLElement, target: HTMLElement) {
  const from = line.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const fromStyle = getComputedStyle(line);
  const toStyle = getComputedStyle(target);
  const sourceText = visibleLines(line, from, fromStyle.lineHeight);
  const targetText = visibleLines(target, to, toStyle.lineHeight);
  const frames = [textFrame(from, fromStyle), textFrame(to, toStyle)];
  const move = { duration: REVEAL, easing: EASE, fill: "both" as const };

  const copy = (text: string) => {
    const proxy = document.createElement("p");
    proxy.className = "walkthrough-splash-glide";
    proxy.setAttribute("aria-hidden", "true");
    proxy.textContent = text;
    Object.assign(proxy.style, {
      fontFamily: toStyle.fontFamily,
      fontOpticalSizing: toStyle.fontOpticalSizing,
      fontVariationSettings: toStyle.fontVariationSettings,
    });
    layer.append(proxy);
    // Allo recalculates its optical spacing at each actual font size.
    proxy.animate(frames, move);
    return proxy;
  };

  const source = copy(sourceText);
  line.style.visibility = "hidden";
  if (sourceText !== targetText) {
    const handover = {
      duration: REVEAL * 0.3,
      delay: REVEAL * 0.15,
      easing: "ease-in-out",
      fill: "both" as const,
    };
    source.animate([{ opacity: 1 }, { opacity: 0 }], handover);
    copy(targetText).animate([{ opacity: 0 }, { opacity: 1 }], handover);
  }
}

/** The wave covers the old view, then the title copies hand off to the new one. */
export function WalkthroughSplash({
  run,
  onCovered,
  onDone,
}: {
  run: SplashRun;
  /** The screen is covered and the next view is on its way underneath. */
  onCovered: () => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const wave = useRef<DistortionWaveHandle>(null);
  const waveFinished = useRef<() => void>(() => {});
  const skip = useRef<() => void>(() => {});

  // The splash is fixed above the current page. Use the library's DOM capture
  // on the underlying viewport for the first texture, including its scroll.
  const capture: CaptureFunction = async ({
    slot, element, width, height, scale, background, ignore,
  }) => {
    const box = {
      position: "absolute",
      inset: "0",
      margin: "0",
      width: `${width}px`,
      height: `${height}px`,
    };
    if (slot === "revealed") {
      const { canvas } = await snapshot(element, {
        width, height, scale, background,
        skip: ignore,
        force: (node) => {
          if (node === element) return snapshotStyles(node, box);
          if (node.getAttribute("data-dw-layer") === "revealed") {
            return snapshotStyles(node, { opacity: "1", visibility: "visible" });
          }
          return snapshotStyles(node);
        },
      });
      return canvas;
    }

    const body = document.body;
    const { scrollX, scrollY } = window;
    const { canvas } = await snapshot(body, {
      width, height, scale, background,
      skip: (node) => node === root.current || node.matches("nextjs-portal, [data-dw-skip]"),
      force: (node) => {
        if (node === body) return snapshotStyles(node, box);
        if (node.hasAttribute("data-lens-content") && (scrollX || scrollY)) {
          return snapshotStyles(node, {
            position: "relative",
            top: `${-scrollY}px`,
            left: `${-scrollX}px`,
          });
        }
        return snapshotStyles(node);
      },
    });
    return canvas;
  };

  useEffect(() => {
    const layer = root.current;
    const cover = sheet.current;
    const list = lines.current;
    const effect = wave.current;
    if (!layer || !cover || !list || !effect) return;

    const { href } = run;
    const timers: number[] = [];
    const hiddenTargets: HTMLElement[] = [];
    let covered = false;
    let handedOff = false;
    let finished = false;
    let startedAt = 0;

    const coverPage = () => {
      if (covered) return;
      covered = true;
      // Swap the library's revealed surface for the original feathered sheet
      // before updating the page underneath it.
      cover.style.opacity = "1";
      if (effect.element) effect.element.style.visibility = "hidden";
      if (window.location.pathname === href) {
        // The visitor picked the walkthrough that was already open.
        window.scrollTo(0, 0);
      } else {
        router.push(href);
      }
      onCovered();
    };

    // The button has to stay above the wave to be seen leaving, but it
    // lives in the AI layer beneath it. A copy takes its exact place up here
    // (squircle clip path and all) and the original steps out of sight.
    const pressed = run.button;
    const rect = pressed.getBoundingClientRect();
    const ghost = pressed.cloneNode(true) as HTMLElement;
    ghost.classList.add("walkthrough-splash-button");
    ghost.setAttribute("aria-hidden", "true");
    ghost.inert = true;
    Object.assign(ghost.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    layer.append(ghost);
    pressed.style.visibility = "hidden";
    const items = [...list.children] as HTMLElement[];
    const entrances: Animation[] = [];

    const play = () => {
      if (finished || handedOff) return;
      startedAt = performance.now();
      effect.play({ source: pressed });
      ghost.animate(
        [
          { transform: "scale(1)", filter: "blur(0)" },
          { transform: `scale(${BUTTON_SCALE})`, filter: `blur(${BUTTON_BLUR})` },
        ],
        { duration: BUTTON_EXIT, easing: EASE, fill: "forwards" },
      );
      ghost.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: BUTTON_EXIT,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      });
      items.forEach((item, i) => {
        entrances.push(item.animate([HIDDEN, SHOWN], {
          duration: LINE_DUR,
          delay: LINES_FROM + i * LINE_STEP,
          easing: EASE,
          fill: "both",
        }));
      });
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    const readTargets = (): SplashTargets | undefined => {
      if (window.location.pathname !== href) return;
      const walkthrough = document.querySelector('[data-chain-source="tour"]');
      const eyebrow = walkthrough?.querySelector<HTMLElement>('[data-splash-target="eyebrow"]');
      const title = walkthrough?.querySelector<HTMLElement>('[data-splash-target="title"]');
      if (eyebrow && title) return { eyebrow, title };
    };

    const pageReady = () =>
      new Promise<SplashTargets | null>((resolve) => {
        const started = performance.now();
        const look = () => {
          const targets = readTargets();
          if (targets) {
            resolve(targets);
          } else if (finished || performance.now() - started > PAGE_WAIT) {
            resolve(null);
          } else {
            requestAnimationFrame(look);
          }
        };
        look();
      });

    const handOff = async () => {
      if (handedOff) return;
      handedOff = true;
      coverPage();
      layer.dataset.revealing = "true";
      const targets = await pageReady();
      if (finished) return;
      const [eyebrowLine, titleLine, ...rest] = items;

      // Hidden until the gliding copies arrive, so the wipe never uncovers a
      // second eyebrow and title beneath the moving ones.
      if (eyebrowLine && targets?.eyebrow) hiddenTargets.push(targets.eyebrow);
      if (titleLine && targets?.title) hiddenTargets.push(targets.title);
      for (const target of hiddenTargets) target.style.setProperty("opacity", "0");

      const wipe = wipeGradientSheet(cover);

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

      const glide = (line: HTMLElement | undefined, target: HTMLElement | undefined) => {
        if (!line) return;
        if (!target) {
          line.animate(exit, { duration: EXIT, easing: EASE, fill: "forwards" });
          return;
        }
        glideText(layer, line, target);
      };
      glide(eyebrowLine, targets?.eyebrow);
      glide(titleLine, targets?.title);

      wipe.finished.then(finish, finish);
    };

    waveFinished.current = () => {
      if (finished || handedOff) return;
      coverPage();
      const titlesReady = LINES_FROM + (items.length - 1) * LINE_STEP + LINE_DUR;
      const remaining = Math.max(0, Math.max(HANDOFF_AT, titlesReady) - (performance.now() - startedAt));
      timers.push(window.setTimeout(handOff, remaining));
    };
    skip.current = () => {
      if (handedOff) return;
      effect.reset();
      ghost.remove();
      if (entrances.length) {
        for (const entrance of entrances) entrance.finish();
      } else {
        for (const item of items) item.style.opacity = "1";
      }
      void handOff();
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skip.current();
    };
    window.addEventListener("keydown", onKey);
    router.prefetch(href);
    // Defer the first capture until after the mount, including Strict Mode's
    // setup/cleanup cycle. Start as soon as both textures are ready.
    const captureFrame = requestAnimationFrame(() => {
      let timeout = 0;
      const deadline = new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, CAPTURE_WAIT);
        timers.push(timeout);
      });
      void Promise.race([effect.prepare(), deadline])
        .catch(() => {})
        .then(() => {
          window.clearTimeout(timeout);
          play();
        });
    });

    return () => {
      finished = true;
      cancelAnimationFrame(captureFrame);
      timers.forEach(window.clearTimeout);
      ghost.remove();
      pressed.style.removeProperty("visibility");
      window.removeEventListener("keydown", onKey);
      for (const target of hiddenTargets) target.style.removeProperty("opacity");
    };
    // One run per mount: AIExperience keys this component by run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={root}
      className="walkthrough-splash"
      style={{ "--splash-feather": `${GRADIENT_FEATHER}px` } as React.CSSProperties}
      onClick={() => skip.current()}
    >
      <DistortionWave
        ref={wave}
        className="walkthrough-splash-wave"
        {...gradientWave}
        capture={capture}
        revealedContent={<div className="walkthrough-splash-fill" />}
        onFinish={(revealed) => {
          if (revealed) waveFinished.current();
        }}
        aria-hidden="true"
      />
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
