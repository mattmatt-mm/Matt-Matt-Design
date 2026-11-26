"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr/ArrowLeft";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr/ArrowRight";
import { X } from "@phosphor-icons/react/dist/ssr/X";
import {
  type ComponentType,
  type CSSProperties,
  type ImgHTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  constrainCorner,
  type Direction,
  foldLayout,
  type FoldLayout,
  pageRange,
  type Point,
  projectFold,
} from "./page-fold";
import styles from "./Photobook.module.css";

const PAGE_SIZES = "(max-width: 751px) 100vw, (pointer: coarse) and (max-height: 600px) 100vw, 50vw";

export type PhotobookPage = { src: string; alt: string; width: number; height: number };

export type PhotobookImageProps = PhotobookPage &
  Pick<ImgHTMLAttributes<HTMLImageElement>, "className" | "draggable" | "fetchPriority" | "loading" | "sizes">;

export type PhotobookProps = {
  pages: readonly PhotobookPage[];
  id?: string;
  label?: string;
  imageRenderer?: ComponentType<PhotobookImageProps>;
};

type PageTurn = { direction: Direction; fromStart: number; fromEnd: number };
type Drag = { layout: FoldLayout; target: [number, number]; point: Point; restingGutterOpacity?: number };
type CornerGesture = Drag & { id: number; pointerStart: Point; moved: boolean };

function BrowserImage(props: PhotobookImageProps) {
  return <img {...props} />;
}

const ImageRenderer = createContext<ComponentType<PhotobookImageProps>>(BrowserImage);

export function Photobook({ imageRenderer = BrowserImage, ...props }: PhotobookProps) {
  return props.pages.length > 0 ? (
    <ImageRenderer.Provider value={imageRenderer}>
      <Reader {...props} />
    </ImageRenderer.Provider>
  ) : null;
}

function draggedPoint(event: PointerEvent, gesture: CornerGesture) {
  return constrainCorner(gesture.layout, {
    x: gesture.layout.corner.x + event.clientX - gesture.pointerStart.x,
    y: gesture.layout.corner.y + event.clientY - gesture.pointerStart.y,
  });
}

function Reader({ pages, id, label = "Photobook" }: PhotobookProps) {
  const Image = useContext(ImageRenderer);
  const zoomTitle = useId();
  const reader = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const zoomDialog = useRef<HTMLDialogElement>(null);
  const zoomTrigger = useRef<HTMLButtonElement>(null);
  const swipe = useRef<{ id: number; x: number; y: number } | null>(null);
  const corner = useRef<CornerGesture | null>(null);
  const dragFrame = useRef<number | null>(null);
  const settleFrame = useRef<number | null>(null);
  const suppressPageTap = useRef(false);
  const [spread, setSpread] = useState(false);
  const [nearReader, setNearReader] = useState(false);
  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<PageTurn | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [zoomPage, setZoomPage] = useState<number | null>(null);

  useEffect(() => {
    const element = reader.current;
    const book = stage.current;
    if (!element || !book) return;

    let previousSpread = false;
    let width = book.clientWidth;
    let height = book.clientHeight;
    const updateMode = () => {
      // CSS positions the cover before hydration. Use the same layout to pair pages.
      const nextSpread = getComputedStyle(book).getPropertyValue("--photobook-columns").trim() === "2";
      if (nextSpread === previousSpread) return;
      previousSpread = nextSpread;
      setSpread(nextSpread);
      setTurn(null);
    };
    const resize = new ResizeObserver(() => {
      const resized = width !== book.clientWidth || height !== book.clientHeight;
      width = book.clientWidth;
      height = book.clientHeight;
      if (resized && (corner.current || settleFrame.current !== null)) {
        corner.current = null;
        if (settleFrame.current !== null) cancelAnimationFrame(settleFrame.current);
        settleFrame.current = null;
        setDrag(null);
      }
      updateMode();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearReader(true);
        intersection.disconnect();
      }
    }, { rootMargin: "320px" });

    updateMode();
    resize.observe(book);
    intersection.observe(element);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      if (dragFrame.current !== null) cancelAnimationFrame(dragFrame.current);
      if (settleFrame.current !== null) cancelAnimationFrame(settleFrame.current);
    };
  }, []);

  const last = pages.length - 1;
  const [start, end] = pageRange(Math.min(page, last), last, spread);
  const pageLabel = start === end
    ? `Page ${start + 1} of ${pages.length}`
    : `Pages ${start + 1}–${end + 1} of ${pages.length}`;
  const neighbours = [start - 1, end + 1]
    .filter((index) => index >= 0 && index <= last)
    .flatMap((index) => {
      const [first, second] = pageRange(index, last, spread);
      return first === second ? [first] : [first, second];
    });

  function navigate(direction: Direction) {
    if (corner.current?.moved || settleFrame.current !== null) return;
    const target = direction === "next" ? end + 1 : start - 1;
    if (target < 0 || target > last) return;

    setPage(pageRange(target, last, spread)[0]);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTurn(reducedMotion ? null : { direction, fromStart: start, fromEnd: end });
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (zoomDialog.current?.open || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    navigate(event.key === "ArrowLeft" ? "previous" : "next");
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (corner.current || settleFrame.current !== null) return;
    suppressPageTap.current = !event.isPrimary;
    const targetElement = event.target as Element;
    const handle = targetElement.closest<HTMLElement>("[data-book-corner]");
    if (handle && event.isPrimary && event.button === 0 && !turn) {
      const direction = handle.dataset.bookCorner === "next" ? "next" : "previous";
      const next = direction === "next" ? end + 1 : start - 1;
      const target = pageRange(next, last, spread);
      const box = event.currentTarget.getBoundingClientRect();
      const layout = foldLayout(box.width, box.height, spread, start !== end, target[0] !== target[1], direction);
      corner.current = {
        id: event.pointerId, pointerStart: { x: event.clientX, y: event.clientY },
        layout, target, point: layout.corner, moved: false,
      };
      swipe.current = null;
      handle.setPointerCapture(event.pointerId);
      return;
    }
    if (event.pointerType !== "touch" || !targetElement.closest("[data-page-direction]")) return;
    swipe.current = event.isPrimary
      ? { id: event.pointerId, x: event.clientX, y: event.clientY }
      : null;
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const gesture = corner.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    if (!gesture.moved && Math.hypot(event.clientX - gesture.pointerStart.x, event.clientY - gesture.pointerStart.y) < 5) return;

    gesture.moved = true;
    suppressPageTap.current = true;
    gesture.point = draggedPoint(event, gesture);
    if (dragFrame.current !== null) return;

    dragFrame.current = requestAnimationFrame(() => {
      dragFrame.current = null;
      if (corner.current !== gesture) return;
      setDrag({ layout: gesture.layout, target: gesture.target, point: gesture.point });
    });
  }

  function releaseCorner(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const gesture = corner.current;
    if (!gesture || gesture.id !== event.pointerId) return false;
    corner.current = null;
    if (!gesture.moved) return true;

    const { layout, target } = gesture;
    const point = cancelled ? gesture.point : draggedPoint(event, gesture);
    const commit = !cancelled && Math.abs(point.x - layout.corner.x) >= layout.pageWidth * 0.42;
    const destination = commit ? layout.landing : layout.corner;
    const landsOnSpread = commit ? layout.toPair : layout.fromPair;
    const finish = () => {
      settleFrame.current = null;
      if (commit) setPage(target[0]);
      setDrag(null);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return true;
    }

    const started = performance.now();
    const settle = (now: number) => {
      const elapsed = (now - started) / 260;
      if (elapsed >= 1) {
        finish();
        return;
      }
      const progress = 1 - (1 - Math.max(0, elapsed)) ** 3;
      // Settle the shadow before removing the fold, even if the last frame is skipped.
      const restFade = Math.min(1, Math.max(0, (elapsed - 0.72) / 0.17));
      setDrag({
        layout,
        target,
        point: {
          x: point.x + (destination.x - point.x) * progress,
          y: point.y + (destination.y - point.y) * progress,
        },
        restingGutterOpacity: landsOnSpread ? restFade : 0,
      });
      settleFrame.current = requestAnimationFrame(settle);
    };
    settleFrame.current = requestAnimationFrame(settle);
    return true;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (releaseCorner(event, false)) return;
    const gesture = swipe.current;
    swipe.current = null;
    if (!gesture || gesture.id !== event.pointerId) return;

    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    suppressPageTap.current = Math.hypot(x, y) > 12;
    if (Math.abs(x) >= 40 && Math.abs(x) > Math.abs(y) * 1.3) {
      navigate(x < 0 ? "next" : "previous");
    }
  }

  function finishTurn() {
    setTurn((active) => active === turn ? null : active);
  }

  function openZoom() {
    const dialog = zoomDialog.current;
    if (!dialog || dialog.open) return;

    setZoomPage(start);
    dialog.showModal();
  }

  const pair = start !== end;
  const fromPair = turn !== null && turn.fromStart !== turn.fromEnd;
  const coverTurn = turn && pair !== fromPair ? (pair ? "open" : "close") : undefined;
  const fold = turn && (pair || fromPair);
  const pageTargets: { index: number; direction: Direction }[] = pair
    ? [{ index: start, direction: "previous" }, { index: end, direction: "next" }]
    : [{ index: start, direction: start === last ? "previous" : "next" }];
  const cover = pages[0];
  const stageStyle = { "--photobook-page-ratio": cover.width / cover.height } as CSSProperties;

  return (
    <section
      ref={reader}
      id={id}
      aria-label={label}
      className={styles.reader}
      tabIndex={-1}
      onKeyDown={onKeyDown}
    >
      <div
        ref={stage}
        className={styles.stage}
        data-spread={spread || undefined}
        data-dragging={drag ? "" : undefined}
        data-cover-turn={coverTurn}
        data-direction={turn?.direction}
        style={stageStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(event) => {
          releaseCorner(event, true);
          swipe.current = null;
          suppressPageTap.current = true;
        }}
        onLostPointerCapture={(event) => { releaseCorner(event, true); }}
      >
        <div
          key={start}
          className={styles.paper}
          data-enter={fold ? undefined : turn?.direction}
          aria-hidden={last > 0 || undefined}
          onAnimationEnd={fold ? undefined : finishTurn}
        >
          <PageImage page={pages[start]} cover={start === 0} />
          {pair && <PageImage page={pages[end]} />}
        </div>

        {fold && (
          <div key={`turn-${start}`} className={styles.turn} aria-hidden>
            {fromPair && (
              <div className={styles.heldPage}>
                <PageImage
                  page={pages[turn.direction === "next" ? turn.fromStart : turn.fromEnd]}
                  decorative
                />
              </div>
            )}
            <div className={styles.gutter} data-turn={coverTurn ?? "fold"} />
            <div className={styles.leaf} onAnimationEnd={finishTurn}>
              <div className={styles.face}>
                <PageImage
                  page={pages[turn.direction === "next" ? turn.fromEnd : turn.fromStart]}
                  decorative
                />
              </div>
              <div className={`${styles.face} ${styles.faceBack}`}>
                <PageImage page={pages[turn.direction === "next" ? start : end]} decorative />
              </div>
            </div>
          </div>
        )}

        {pair && (
          <div key={`gutter-${start}`} className={`${styles.gutter} ${styles.restingGutter}`} aria-hidden />
        )}

        {drag && <DraggedPage drag={drag} pages={pages} start={start} end={end} />}

        {last > 0 && (
          <div className={styles.pageTargets}>
            {pageTargets.map(({ index, direction }) => (
              <button
                key={direction}
                type="button"
                className={styles.pageTrigger}
                data-page-direction={direction}
                aria-label={`${direction === "next" ? "Turn forward" : "Turn back"}. ${pages[index].alt}`}
                onClick={(event) => {
                  // A swipe can produce a click on the same page control.
                  if (event.detail > 0 && suppressPageTap.current) return;
                  navigate(direction);
                }}
              >
                <span className={styles.corner} data-book-corner={direction} aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          aria-label="Previous page"
          aria-disabled={start === 0}
          className={`${styles.button} press-shrink`}
          onClick={() => navigate("previous")}
        >
          <ArrowLeft size={20} aria-hidden />
        </button>
        {spread ? (
          <p role="status" aria-atomic="true">{pageLabel}</p>
        ) : (
          <button
            ref={zoomTrigger}
            type="button"
            className={styles.pageCount}
            aria-label={`${pageLabel}. Enlarge page`}
            aria-haspopup="dialog"
            onClick={openZoom}
          >
            <span role="status" aria-atomic="true">{pageLabel}</span>
          </button>
        )}
        <button
          type="button"
          aria-label="Next page"
          aria-disabled={end === last}
          className={`${styles.button} press-shrink`}
          onClick={() => navigate("next")}
        >
          <ArrowRight size={20} aria-hidden />
        </button>
      </div>

      {nearReader && (
        <div hidden>
          {neighbours.map((index) => (
            <PageImage key={index} page={pages[index]} decorative prefetch />
          ))}
        </div>
      )}

      <dialog
        ref={zoomDialog}
        className={styles.zoom}
        aria-labelledby={zoomTitle}
        onClose={() => {
          setZoomPage(null);
          zoomTrigger.current?.focus({ preventScroll: true });
        }}
        data-lenis-prevent
      >
        <div className={styles.zoomBar}>
          <h2 id={zoomTitle}>
            {zoomPage === null ? label : `Page ${zoomPage + 1} of ${pages.length}`}
          </h2>
          <button
            type="button"
            aria-label="Close zoom"
            className={`${styles.button} press-shrink`}
            onClick={() => zoomDialog.current?.close()}
          >
            <X size={20} aria-hidden />
          </button>
        </div>
        {zoomPage !== null && (
          <div className={styles.zoomScroll} tabIndex={0} role="region" aria-label="Zoomed page">
            <Image {...pages[zoomPage]} loading="eager" draggable={false} />
          </div>
        )}
      </dialog>
    </section>
  );
}

function DraggedPage({ drag, pages, start, end }: {
  drag: Drag;
  pages: readonly PhotobookPage[];
  start: number;
  end: number;
}) {
  const { layout, point, target: [first, second], restingGutterOpacity = 0 } = drag;
  const fold = projectFold(layout, point);
  if (!fold) return null;

  const { forward, fromPair, toPair, pageWidth } = layout;
  const sheet = { left: fold.left, width: pageWidth };
  const held = { left: fold.left + (forward ? -pageWidth : pageWidth), width: pageWidth };
  const layerStyle = {
    clipPath: fromPair || toPair ? undefined : `inset(0 ${layout.sourceLeft}px)`,
    "--photobook-lift": Math.sin(fold.progress * Math.PI),
  } as CSSProperties;
  // On cover turns, fade the gutter over the half of the motion nearest the spread.
  const spreadProgress = fromPair ? 1 - fold.progress : fold.progress;
  const gutterOpacity = fromPair && toPair ? 1 : Math.max(0, 2 * spreadProgress - 1);
  const activeGutterOpacity = gutterOpacity * (1 - restingGutterOpacity);

  return (
    <div className={styles.dragLayer} style={layerStyle} aria-hidden>
      {fromPair && (
        <div className={styles.dragPage} style={held}>
          <PageImage page={pages[forward ? start : end]} decorative />
        </div>
      )}
      {(toPair || !fromPair) && (
        <div className={`${styles.dragPage} ${styles.dragShaded}`} style={sheet}>
          <PageImage page={pages[forward ? second : first]} decorative />
        </div>
      )}
      <div className={`${styles.dragPage} ${styles.dragShaded}`} style={{ ...sheet, clipPath: fold.frontClip }}>
        <PageImage page={pages[forward ? end : start]} decorative />
      </div>
      {(fromPair || toPair) && activeGutterOpacity > 0 && (
        <div className={styles.gutter} style={{
          left: fold.left + (forward ? 0 : pageWidth),
          opacity: activeGutterOpacity,
        }} />
      )}
      <div
        className={`${styles.dragPage} ${styles.dragBack}`}
        style={{ ...sheet, clipPath: fold.backClip, transform: fold.reflection }}
      >
        <PageImage page={pages[forward ? first : second]} decorative />
      </div>
      {restingGutterOpacity > 0 && (
        <div className={`${styles.gutter} ${styles.restingGutter}`} style={{ opacity: restingGutterOpacity }} />
      )}
    </div>
  );
}

function PageImage({ page, cover = false, decorative = false, prefetch = false }: {
  page: PhotobookPage;
  cover?: boolean;
  decorative?: boolean;
  prefetch?: boolean;
}) {
  const Image = useContext(ImageRenderer);
  return (
    <Image
      {...page}
      alt={decorative ? "" : page.alt}
      className={styles.page}
      sizes={PAGE_SIZES}
      loading={cover || decorative ? "eager" : "lazy"}
      fetchPriority={cover ? "high" : prefetch ? "low" : undefined}
      draggable={false}
    />
  );
}
